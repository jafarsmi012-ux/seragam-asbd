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

function generateOrderNumber(existingCount: number): string {
  const num = existingCount + 1;
  return `ASBD-2026-${String(num).padStart(4, '0')}`;
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

      if (body.proofUrl && body.proofUrl.startsWith('data:')) {
        const fileExt = (() => {
          const mime = body.proofUrl.split(';')[0]?.split(':')[1] || 'image/png';
          if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
          if (mime.includes('png')) return 'png';
          if (mime.includes('pdf')) return 'pdf';
          return 'jpg';
        })();

        proofFileName = `${body.studentName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
        const base64Data = body.proofUrl.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

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

      // Get current order count for numbering
      const { count } = await admin
        .from('orders')
        .select('*', { count: 'exact', head: true });

      const orderNumber = generateOrderNumber(count || 0);

      // Insert order to Supabase
      const { data: inserted, error: dbError } = await admin
        .from('orders')
        .insert({
          order_number: orderNumber,
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
        })
        .select('order_number, student_name, product_type, size_asbd, qty, total_price')
        .single();

      if (dbError) {
        console.error('DB insert error:', dbError);
        return NextResponse.json(
          { error: 'Gagal menyimpan pesanan ke database' },
          { status: 500 }
        );
      }

      // Fire Telegram notification
      sendTelegramNotification({
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
    const orderNumber = generateOrderNumber(globalThis.__ordersStore.counter - 1);

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

    // Fire Telegram notification
    sendTelegramNotification({
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