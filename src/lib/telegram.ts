/**
 * Telegram Notification Utility
 *
 * Sends order notification to a configured Telegram chat via Bot API.
 * To enable:
 *   1. Create a bot via @BotFather on Telegram, get the BOT_TOKEN
 *   2. Get the CHAT_ID (send /start to your bot, then check
 *      https://api.telegram.org/bot<TOKEN>/getUpdates for the chat_id)
 *   3. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local
 */

interface TelegramOrderPayload {
  orderNumber: string;
  studentName: string;
  className: string;
  parentName: string;
  whatsapp: string;
  productType: string;
  sizeAsbd: number;
  qty: number;
  totalPrice: number;
  notes: string;
  hasProof: boolean;
}

export async function sendTelegramNotification(
  payload: TelegramOrderPayload
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Skip silently if not configured (demo mode)
  if (!botToken || !chatId) {
    console.log(
      '[Telegram] Skipped — TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set.'
    );
    return;
  }

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  const text = [
    '🛒 <b>Pesanan Baru — Seragam ASBD</b>',
    '',
    `📋 <b>No Pesanan:</b> ${payload.orderNumber}`,
    `👤 <b>Siswa:</b> ${payload.studentName}`,
    `🏫 <b>Kelas:</b> ${payload.className}`,
    `👨‍👩‍👧 <b>Orang Tua:</b> ${payload.parentName}`,
    `📱 <b>WhatsApp:</b> ${payload.whatsapp}`,
    '',
    `👕 <b>Produk:</b> ${payload.productType}`,
    `📏 <b>Ukuran ASBD:</b> ${payload.sizeAsbd}`,
    `🔢 <b>Jumlah:</b> ${payload.qty} pcs`,
    `💰 <b>Total:</b> ${formatRupiah(payload.totalPrice)}`,
    payload.notes ? `📝 <b>Catatan:</b> ${payload.notes}` : '',
    '',
    `${payload.hasProof ? '✅' : '⚠️'} Bukti transfer ${
      payload.hasProof ? 'telah diupload' : '<b>tidak</b> diupload'
    }`,
    '',
    `<i>Verifikasi di admin dashboard.</i>`,
  ]
    .filter(Boolean)
    .join('\n');

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  console.log(`[Telegram] Sending notif for ${payload.orderNumber} to chat ${chatId}...`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(8000),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      console.error(
        `[Telegram] API error ${res.status} for ${payload.orderNumber}:`,
        JSON.stringify(body)
      );
    } else {
      const messageId = body?.result?.message_id;
      console.log(
        `[Telegram] Notif sent for ${payload.orderNumber} (message_id=${messageId})`
      );
    }
  } catch (err) {
    // Don't block order creation if Telegram fails
    console.error(
      `[Telegram] Failed to send notification for ${payload.orderNumber}:`,
      err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    );
  }
}