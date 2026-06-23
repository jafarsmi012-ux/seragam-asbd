# Pemesanan Seragam ASBD
## SD Islam Al Azhar 62 Summarecon Bandung — Tahun Ajaran 2026/2027

Website pemesanan seragam ASBD (Alat Seragam Daerah Berbeda) — modern, mobile-friendly, dan siap deploy ke Vercel. Dibangun dengan **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS 4**, dan **Supabase**.

---

## Daftar Isi
- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Setup Supabase](#setup-supabase)
- [Setup Lokal](#setup-lokal)
- [Environment Variables](#environment-variables)
- [Deploy ke Vercel](#deploy-ke-vercel)
- [Struktur Folder](#struktur-folder)
- [Keamanan](#keamanan)

---

## Fitur

### Halaman Utama (Orang Tua / Wali Murid)
- Hero section dengan branding sekolah
- Tabel ukuran & harga (responsive — tabel di desktop, card di mobile)
- Informasi rekening pembayaran dengan tombol salin
- Multi-step form pemesanan (4 langkah):
  1. **Data Siswa** — nama, kelas, orang tua, WhatsApp, catatan
  2. **Pilih Pesanan** — jenis produk, ukuran, jumlah, ringkasan harga otomatis
  3. **Pembayaran** — total, rekening bank, petunjuk transfer
  4. **Konfirmasi** — upload bukti transfer (JPG/PNG otomatis dikecilkan maks **3MB**, atau PDF maks **3MB**)
- Halaman sukses dengan nomor order dan ringkasan
- Sticky order summary di bawah layar mobile

### Dashboard Admin (`/admin`)
- Login dengan password (sesi via cookie httpOnly, tahan 8 jam)
- Daftar pesanan dengan search, filter kelas & status
- Ubah status pesanan (Menunggu Verifikasi → Lunas → Sedang Produksi → Siap Distribusi → Selesai)
- Export CSV
- Rekap statistik: total pesanan, omzet, qty, jumlah kelas
- Tombol logout

---

## Tech Stack

| Teknologi | Keterangan |
|-----------|------------|
| Next.js 16 | React framework dengan App Router |
| React 19 | UI library |
| TypeScript 5 | Type safety |
| Tailwind CSS 4 | Utility-first CSS |
| shadcn/ui | UI component library |
| Zustand | State management |
| Framer Motion | Animasi |
| Supabase | Database PostgreSQL + Storage |
| Telegram Bot API | Notifikasi pesanan (opsional) |

---

## Setup Supabase

### 1. Buat Project
1. Buka [supabase.com](https://supabase.com) → buat project baru
2. Catat **Project URL** dan **anon public key** dari `Settings → API`

### 2. Jalankan SQL untuk Membuat Tabel
Buka `SQL Editor` di Supabase Dashboard, lalu jalankan isi file:

```
supabase/create_tables.sql
supabase/seed_size_prices.sql
```

Skema otomatis membuat:
- Tabel `orders` (pesanan) + index
- Tabel `size_prices` (ukuran & harga)
- Row Level Security (RLS) policy

### 3. Buat Storage Bucket `payment-proofs`
Di Supabase Dashboard → **Storage** → **New bucket**:
- Name: `payment-proofs`
- Public bucket: **ON** (agar URL bukti transfer bisa diakses publik)

Lalu jalankan SQL berikut di SQL Editor untuk storage policy:

```sql
-- Allow public upload ke bucket payment-proofs
CREATE POLICY "Allow public upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs');

-- Allow public read dari bucket payment-proofs
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'payment-proofs');

-- Allow authenticated users delete (untuk admin)
CREATE POLICY "Allow authenticated delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'payment-proofs');
```

---

## Setup Lokal

### 1. Clone & Install
```bash
git clone <repo-url>
cd seragam-asbd
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```
Edit `.env` dan isi nilai Supabase + ADMIN_PASSWORD (lihat bagian di bawah).

### 3. Jalankan Dev Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000).

### 4. Build untuk Production
```bash
npm run build
npm start
```

---

## Environment Variables

Semua env yang dibutuhkan ada di `.env.example`. Salin dan isi nilainya.

| Nama | Wajib | Keterangan |
|------|-------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL project Supabase (di-expose ke client) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Anon public key (aman di-expose ke client) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (server-side only, **JANGAN** pakai prefix `NEXT_PUBLIC_`) |
| `ADMIN_PASSWORD` | ✅ | Password login `/admin`. Wajib kuat di production. |
| `TELEGRAM_BOT_TOKEN` | ❌ | Token bot Telegram (untuk notifikasi) |
| `TELEGRAM_CHAT_ID` | ❌ | Chat ID tujuan notifikasi |

**Catatan penting**:
- Prefix `NEXT_PUBLIC_` artinya env di-bundle ke client-side. **Hanya** untuk value yang aman di-publik (anon key, URL).
- `SUPABASE_SERVICE_ROLE_KEY` **tidak boleh** pakai prefix `NEXT_PUBLIC_` — bypass RLS, hanya untuk API routes server.
- Di production, jika `ADMIN_PASSWORD` kosong atau default (`admin123`), login ditolak.

---

## Deploy ke Vercel

### Opsi A — Via Dashboard (paling mudah)

1. **Push ke GitHub**
   ```bash
   git init   # kalau belum
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```

2. **Import ke Vercel**
   - Buka [vercel.com/new](https://vercel.com/new)
   - Pilih repository GitHub Anda → klik **Import**
   - Framework Preset: **Next.js** (otomatis terdeteksi)
   - Biarkan build settings default:
     - Build Command: `next build` (atau `npm run build`)
     - Output Directory: `.next`
     - Install Command: `npm install`
   - Klik **Environment Variables**, tambahkan:
     ```
     NEXT_PUBLIC_SUPABASE_URL       = https://xxxxx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY  = eyJ...
     SUPABASE_SERVICE_ROLE_KEY      = eyJ...
     ADMIN_PASSWORD                 = <password-kuat-anda>
     ```
     (Telegram opsional)
   - Klik **Deploy**

3. **Selesai** — Vercel otomatis:
   - Mendeteksi Next.js
   - Build + deploy
   - HTTPS + CDN
   - Preview URL untuk tiap push ke PR

### Opsi B — Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link         # link ke project
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ADMIN_PASSWORD
# ulangi untuk env lain sesuai kebutuhan
vercel --prod       # deploy ke production
```

### Custom Domain (opsional)
- Vercel Dashboard → Project → **Settings** → **Domains**
- Tambahkan domain Anda, ikuti instruksi DNS

---

## Struktur Folder

```
src/
├── app/
│   ├── layout.tsx           # Root layout + viewport meta
│   ├── page.tsx             # Halaman utama (landing + form order)
│   ├── globals.css          # Tailwind + tema warna
│   ├── admin/
│   │   └── page.tsx         # Route /admin dashboard
│   └── api/
│       ├── orders/
│       │   └── route.ts           # POST: buat order + upload bukti
│       └── admin/
│           ├── login/route.ts     # POST: login admin (set cookie)
│           ├── logout/route.ts    # POST: logout (clear cookie)
│           └── orders/route.ts    # GET/PATCH: list & update order
├── components/
│   ├── admin/AdminView.tsx
│   ├── landing/             # Hero, SizeChart, PaymentCard, Footer
│   ├── order/               # StudentForm, ProductForm, PaymentStep, ...
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── supabase.ts          # Supabase client + admin client (server)
│   ├── store.ts             # Zustand store (state global)
│   ├── telegram.ts          # Notifikasi Telegram
│   └── utils.ts             # Helper: formatRupiah, validasi file, dll.
└── data/
    └── sizePrices.ts        # Daftar ukuran & harga
```

---

## Keamanan

- **Service role key** tidak pernah di-bundle ke client. Dipakai hanya di server-side API routes via `getAdminClient()`.
- **Upload bukti transfer** divalidasi di dua sisi:
  - Client: tipe file (JPG/PNG/PDF). Image di-resize otomatis ke **max 1600×1600 px, JPEG quality 75%** sebelum upload. Kalau hasil masih > 2 MB, kompres lebih agresif (1280 px q55%). PDF dilewatkan apa adanya. Image maks **3MB**, PDF maks **3MB**.
  - Server (`/api/orders`): MIME type + ukuran buffer (3MB image / 3MB PDF) + validasi ekstensi (sebelum disimpan ke Supabase Storage)
  - **Catatan**: Limit 3MB dipilih agar base64 payload (file × 4/3) di bawah Vercel function body limit (4.5 MB)
- **Admin dashboard** (`/admin`):
  - Password disimpan di env, banding constant-time
  - Sesi via cookie `admin_session` (httpOnly, sameSite=lax, signed dengan HMAC-SHA256)
  - `/api/admin/orders` menolak request tanpa cookie valid (HTTP 401)
  - Default password `admin123` ditolak di server (HTTP 503) untuk mencegah deploy lupa konfigurasi
- **Environment**:
  - `.env` di-gitignore
  - `.env.example` hanya berisi placeholder

---

## Skrip NPM

| Command | Keterangan |
|---------|------------|
| `npm run dev` | Jalankan dev server di port 3000 |
| `npm run build` | Build production (Next.js + standalone) |
| `npm start` | Jalankan hasil build production |
| `npm run lint` | Jalankan ESLint |

---

## Lisensi

Proprietary — SD Islam Al Azhar 62 Summarecon Bandung.
