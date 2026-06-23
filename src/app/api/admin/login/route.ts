import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Login admin.
 *
 * Stateless session via signed cookie `admin_session`:
 *   value = HMAC-SHA256(secret, "v1")
 *
 * Cookie httpOnly + sameSite=lax. Server memverifikasi dengan secret yang
 * sama di route admin lain (`/api/admin/orders`). Tidak butuh storage.
 *
 * Keamanan:
 *  - Di production, ADMIN_PASSWORD wajib di-set. Default di-tolak.
 *  - Bandingkan password dengan constant-time comparison (timingSafeEqual)
 *    untuk mencegah timing attack.
 */

const COOKIE_NAME = 'admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 jam

function getAdminSecret(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw === 'admin123') return null; // tolak default
  return pw;
}

function signSession(secret: string): string {
  return crypto.createHmac('sha256', secret).update('v1').digest('hex');
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  try {
    const secret = getAdminSecret();
    if (!secret) {
      return NextResponse.json(
        {
          error:
            'ADMIN_PASSWORD belum dikonfigurasi di server. Set env ADMIN_PASSWORD yang kuat.',
        },
        { status: 503 }
      );
    }

    const { password } = await request.json();
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password wajib diisi' },
        { status: 400 }
      );
    }

    if (!timingSafeEqual(password, secret)) {
      // Delay kecil untuk meredam timing attack pada brute-force
      await new Promise((r) => setTimeout(r, 250));
      return NextResponse.json(
        { error: 'Password salah' },
        { status: 401 }
      );
    }

    const token = signSession(secret);
    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });
    return res;
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}
