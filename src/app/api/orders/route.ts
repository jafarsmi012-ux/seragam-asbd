import { NextResponse } from 'next/server';
import { isSupabaseConfigured, getAdminClient } from '@/lib/supabase';
import { sendTelegramNotification } from '@/lib/telegram';

// ── In-memory fallback (demo mode when Supabase not configured) ──

declare global {
  var __ordersStore: {
    orders: Array<{
      id: string;
      orderNumber: string;
      studentName: string;
      className: string;
      parentName: string;
      whatsapp: string;
      productType: string;
      sizeAsbd: number;
      chestCm: number;
      pantsLengthCm: number;
      pantsWaistCm: number;
      unitPrice: number;
      qty: number;
      totalPrice: number;
      senderName: string;
      senderBank: string;
      transferDate: string;
      transferAmount: number;
      proofUrl: string;
      status: string;
      notes: string;
      createdAt: string;
    }>;
    counter: number;
  };
}

if (!globalThis.__ordersStore) {
  globalThis.__ordersStore = { orders: [], counter: 0 };
}

// ── Helpers ──

/**
 * Generate collision-resistant order_number.
 *
 * Format: `ASBD-2026-{4 char base36 timestamp}{4 char base36 random}`
 * Contoh: `ASBD-2026-LM2X-7K3A`
 *
 * Collision probability per detik: 1 / 36^4 ≈ 1 / 1.679.616.
 * Sebelumnya pakai `count + 1` yang rapuh: kalau tabel sudah berisi
 * rows (test data / row sebelumnya) atau ada race condition antara
 * SELECT count dan INSERT, hasilnya duplikat → 409 UNIQUE violation
 * dari Supabase. Lihat commit ini untuk konteks lengkap.
 */
function generateOrderNumber(): string {
  const ts = Math.floor(Date.now() / 1000)
    .toString(36)
    .toUpperCase()
    .padStart(4, '0')
    .slice(-4);
  const rand = Math.floor(Math.random() * 36 ** 4)
    .toString(36)
    .toUpperCase()
    .padStart(4, '0');
  return `ASBD-2026-${ts}${rand}`;
}

// ── POST /api/orders ──

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = [
      'studentName',
      'className',
      'parentName',
      'whatsapp',
      'productType',
      'sizeAsbd',
      'qty',
      'totalPrice',
    ];

    for (const field of required) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json(
          { error: `Field ${field} wajib diisi` },
          { status: 400 }
        );
      }
    }

    // ── Server-side validation: bukti transfer ──
    // Limit di bawah Vercel function body limit (4.5 MB untuk JSON).
    // Base64 file = file * 4/3, jadi maxForType 3MB → base64 ~4MB ✅.
    const MAX_IMAGE_BYTES = 3 * 1024 * 1024;   // 3 MB untuk JPG/PNG (sudah di-resize di client)
    const MAX_PDF_BYTES = 3 * 1024 * 1024;     // 3 MB untuk PDF
    const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'application/pdf']);
    const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'pdf']);

    let proofDataUrl = '';
    let proofMime = '';
    if (typeof body.proofUrl === 'string' && body.proofUrl.startsWith('data:')) {
      proofDataUrl = body.proofUrl;
      const headerMatch = /^data:([^;]+);base64,/.exec(proofDataUrl);
      proofMime = headerMatch?.[1]?.toLowerCase() || '';
    }

    if (proofDataUrl) {
      if (!ALLOWED_MIME.has(proofMime)) {
        return NextResponse.json(
          { error: 'Format bukti transfer tidak didukung. Gunakan JPG, PNG, atau PDF.' },
          { status: 400 }
        );
      }
      // Estimasi ukuran dari panjang base64 (4 char base64 ≈ 3 byte).
      const base64Part = proofDataUrl.split(',')[1] || '';
      const approxBytes = Math.floor((base64Part.length * 3) / 4);
      const maxForType = proofMime === 'application/pdf' ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
      if (approxBytes > maxForType) {
        const limit = proofMime === 'application/pdf' ? '3MB' : '3MB';
        return NextResponse.json(
          { error: `Ukuran bukti transfer melebihi batas ${limit}. Coba kompres atau crop ulang.` },
          { status: 413 }
        );
      }
    }

    // ── Supabase mode ──
    if (isSupabaseConfigured) {
      const admin = getAdminClient();
      if (!admin) {
        return NextResponse.json(
          { error: 'Supabase admin client gagal diinisialisasi' },
          { status: 500 }
        );
      }

      // Upload proof file to Supabase Storage (if base64 data provided)
      let proofUrl = '';
      let proofFileName = '';

      if (proofDataUrl) {
        const fileExt = (() => {
          if (proofMime.includes('jpeg') || proofMime.includes('jpg')) return 'jpg';
          if (proofMime.includes('png')) return 'png';
          if (proofMime.includes('pdf')) return 'pdf';
          return 'jpg';
        })();

        if (!ALLOWED_EXT.has(fileExt)) {
          return NextResponse.json(
            { error: 'Ekstensi bukti transfer tidak valid.' },
            { status: 400 }
          );
        }

        proofFileName = `${String(body.studentName || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.${fileExt}`;
        const base64Data = proofDataUrl.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const maxForType = fileExt === 'pdf' ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
        if (buffer.byteLength > maxForType) {
          const limit = fileExt === 'pdf' ? '3MB' : '3MB';
          return NextResponse.json(
            { error: `Ukuran bukti transfer melebihi batas ${limit}.` },
            { status: 413 }
          );
        }

        const { error: uploadError } = await admin.storage
          .from('payment-proofs')
          .upload(proofFileName, buffer, {
            contentType: fileExt === 'pdf' ? 'application/pdf' : `image/${fileExt}`,
            upsert: false,
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          // Fallback: store base64 in DB (not ideal but works)
          proofUrl = body.proofUrl;
          proofFileName = '';
        } else {
          const { data: urlData } = admin.storage
            .from('payment-proofs')
            .getPublicUrl(proofFileName);
          proofUrl = urlData.publicUrl;
        }
      }

      // Insert order to Supabase dengan retry pada unique_violation.
      // order_number di-generate ulang tiap attempt untuk handle collision
      // langka (1/1.679.616 per detik, tapi tetap dijaga).
      const baseOrderData = {
        student_name: body.studentName,
        class_name: body.className,
        parent_name: body.parentName,
        whatsapp: body.whatsapp,
        product_type: body.productType,
        size_asbd: Number(body.sizeAsbd),
        chest_cm: Number(body.chestCm) || 0,
        pants_length_cm: Number(body.pantsLengthCm) || 0,
        pants_waist_cm: Number(body.pantsWaistCm) || 0,
        unit_price: Number(body.unitPrice) || 0,
        qty: Number(body.qty),
        total_price: Number(body.totalPrice),
        sender_name: body.senderName || '',
        sender_bank: body.senderBank || '',
        transfer_date: body.transferDate || null,
        transfer_amount: Number(body.transferAmount) || 0,
        proof_url: proofUrl,
        proof_file_name: proofFileName,
        status: 'Menunggu Verifikasi',
        notes: body.notes || '',
      };

      let inserted: {
        order_number: string;
        student_name: string;
        product_type: string;
        size_asbd: number;
        qty: number;
        total_price: number;
      } | null = null;
      let dbError: { code?: string; message?: string } | null = null;
      let orderNumber = '';

      for (let attempt = 0; attempt < 5; attempt++) {
        orderNumber = generateOrderNumber();
        const result = await admin
          .from('orders')
          .insert({ ...baseOrderData, order_number: orderNumber })
          .select('order_number, student_name, product_type, size_asbd, qty, total_price')
          .single();

        if (!result.error && result.data) {
          inserted = result.data as typeof inserted;
          dbError = null;
          break;
        }

        dbError = result.error as { code?: string; message?: string } | null;

        // Retry hanya pada unique_violation (PostgreSQL code 23505).
        // Error lain (RLS, kolom hilang, dst.) langsung fail — retry
        // tidak akan membantu.
        if (dbError?.code !== '23505') break;

        // Backoff kecil untuk meredakan tabrakan antar-request.
        await new Promise((r) => setTimeout(r, 10 + Math.random() * 30));
      }

      if (dbError || !inserted) {
        console.error(
          `DB insert error (code=${dbError?.code ?? 'unknown'}):`,
          dbError?.message ?? 'no data returned'
        );
        return NextResponse.json(
          {
            error: 'Gagal menyimpan pesanan ke database',
            detail: dbError?.message ?? 'Unknown error',
          },
          { status: 500 }
        );
      }

      // Fire Telegram notification (awaited — Vercel serverless kills
      // fire-and-forget fetches after response is returned)
      await sendTelegramNotification({
        orderNumber: orderNumber,
        studentName: body.studentName,
        className: body.className,
        parentName: body.parentName,
        whatsapp: body.whatsapp,
        productType: body.productType,
        sizeAsbd: Number(body.sizeAsbd),
        qty: Number(body.qty),
        totalPrice: Number(body.totalPrice),
        notes: body.notes || '',
        hasProof: !!proofUrl,
      });

      return NextResponse.json({
        success: true,
        order: {
          orderNumber: inserted.order_number,
          studentName: inserted.student_name,
          product: inserted.product_type,
          size: inserted.size_asbd,
          qty: inserted.qty,
          totalPrice: inserted.total_price,
        },
      });
    }

    // ── In-memory mode (demo / no Supabase) ──
    globalThis.__ordersStore.counter += 1;
    const orderNumber = generateOrderNumber();

    const order = {
      id: crypto.randomUUID(),
      orderNumber,
      studentName: body.studentName,
      className: body.className,
      parentName: body.parentName,
      whatsapp: body.whatsapp,
      productType: body.productType,
      sizeAsbd: Number(body.sizeAsbd),
      chestCm: Number(body.chestCm) || 0,
      pantsLengthCm: Number(body.pantsLengthCm) || 0,
      pantsWaistCm: Number(body.pantsWaistCm) || 0,
      unitPrice: Number(body.unitPrice) || 0,
      qty: Number(body.qty),
      totalPrice: Number(body.totalPrice),
      senderName: body.senderName || '',
      senderBank: body.senderBank || '',
      transferDate: body.transferDate || '',
      transferAmount: Number(body.transferAmount) || 0,
      proofUrl: body.proofUrl || '',
      status: 'Menunggu Verifikasi',
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
    };

    globalThis.__ordersStore.orders.push(order);

    // Fire Telegram notification (awaited — Vercel serverless kills
    // fire-and-forget fetches after response is returned)
    await sendTelegramNotification({
      orderNumber: order.orderNumber,
      studentName: order.studentName,
      className: order.className,
      parentName: order.parentName,
      whatsapp: order.whatsapp,
      productType: order.productType,
      sizeAsbd: order.sizeAsbd,
      qty: order.qty,
      totalPrice: order.totalPrice,
      notes: order.notes,
      hasProof: !!order.proofUrl,
    });

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        studentName: order.studentName,
        product: order.productType,
        size: order.sizeAsbd,
        qty: order.qty,
        totalPrice: order.totalPrice,
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat pesanan' },
      { status: 500 }
    );
  }
}