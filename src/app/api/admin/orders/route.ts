import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { isSupabaseConfigured, getAdminClient } from '@/lib/supabase';

// ── Auth: signed-cookie session ──

const COOKIE_NAME = 'admin_session';
const ALLOWED_STATUSES = new Set([
  'Menunggu Verifikasi',
  'Lunas',
  'Sedang Produksi',
  'Siap Distribusi',
  'Selesai',
]);

function verifySession(request: Request): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || secret === 'admin123') return false;

  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return false;

  const value = decodeURIComponent(match.slice(COOKIE_NAME.length + 1));
  const expected = crypto
    .createHmac('sha256', secret)
    .update('v1')
    .digest('hex');

  if (value.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected));
  } catch {
    return false;
  }
}

// ── In-memory fallback ──

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
  } | undefined;
}

// Map DB row (snake_case) → frontend format (camelCase)
function mapDbRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    createdAt: row.created_at,
    studentName: row.student_name,
    className: row.class_name,
    parentName: row.parent_name,
    whatsapp: row.whatsapp,
    productType: row.product_type,
    sizeAsbd: row.size_asbd,
    qty: row.qty,
    totalPrice: row.total_price,
    senderName: row.sender_name || '',
    senderBank: row.sender_bank || '',
    transferAmount: row.transfer_amount || 0,
    status: row.status,
    proofUrl: row.proof_url || '',
    notes: row.notes || '',
  };
}

// ── GET /api/admin/orders ──

export async function GET(request: Request) {
  if (!verifySession(request)) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  try {
    if (isSupabaseConfigured) {
      const admin = getAdminClient();
      if (!admin) {
        return NextResponse.json(
          { error: 'Supabase admin client gagal' },
          { status: 500 }
        );
      }

      const { data, error } = await admin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('DB fetch error:', error);
        return NextResponse.json(
          { error: 'Gagal memuat pesanan' },
          { status: 500 }
        );
      }

      const orders = (data || []).map(mapDbRow);
      return NextResponse.json({ orders, total: orders.length });
    }

    // Fallback: in-memory
    const orders = globalThis.__ordersStore?.orders || [];
    return NextResponse.json({ orders, total: orders.length });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Gagal memuat pesanan' },
      { status: 500 }
    );
  }
}

// ── PATCH /api/admin/orders ──

export async function PATCH(request: Request) {
  if (!verifySession(request)) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'orderId dan status diperlukan' },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured) {
      const admin = getAdminClient();
      if (!admin) {
        return NextResponse.json(
          { error: 'Supabase admin client gagal' },
          { status: 500 }
        );
      }

      const { data, error } = await admin
        .from('orders')
        .update({ status })
        .select('id')
        .eq('id', orderId);

      if (error) {
        console.error('DB update error:', error);
        return NextResponse.json(
          { error: 'Gagal memperbarui status' },
          { status: 500 }
        );
      }

      if (!data || data.length === 0) {
        return NextResponse.json(
          { error: 'Pesanan tidak ditemukan' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Fallback: in-memory
    const orders = globalThis.__ordersStore?.orders || [];
    const orderIndex = orders.findIndex((o) => o.id === orderId);

    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    orders[orderIndex].status = status;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}
