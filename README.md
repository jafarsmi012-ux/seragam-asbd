# Pemesanan Seragam ASBD
## SD Islam Al Azhar 62 Summarecon Bandung — Tahun Ajaran 2026/2027

Website pemesanan seragam ASBD (Alat Seragam Daerah Berbeda) yang modern, mobile-friendly, dan profesional. Dibangun dengan Next.js, Tailwind CSS, dan Supabase.

---

## Fitur

### Halaman Utama (Orang Tua / Wali Murid)
- Hero section dengan branding sekolah
- Tabel ukuran & harga seragam (responsive — tabel di desktop, card di mobile)
- Informasi rekening pembayaran dengan tombol salin
- Multi-step form pemesanan (4 langkah):
  1. **Data Siswa** — nama, kelas, orang tua, WhatsApp, catatan
  2. **Pilih Pesanan** — jenis produk, ukuran, jumlah, dengan ringkasan harga otomatis
  3. **Pembayaran** — total, rekening bank, petunjuk transfer
  4. **Konfirmasi** — detail transfer, upload bukti transfer (JPG/PNG/PDF, maks 5MB)
- Halaman sukses dengan nomor order dan ringkasan pesanan
- Sticky order summary di bawah layar mobile

### Dashboard Admin (`/admin`)
- Login dengan password
- Daftar pesanan dengan search, filter kelas & status
- Ubah status pesanan (Menunggu Verifikasi → Lunas → Sedang Produksi → Siap Distribusi → Selesai)
- Export CSV
- Rekap statistik: total pesanan, omzet, qty, jumlah kelas

---

## Tech Stack

| Teknologi | Keterangan |
|-----------|------------|
| Next.js 16 | React framework dengan App Router |
| TypeScript 5 | Type safety |
| Tailwind CSS 4 | Utility-first CSS |
| shadcn/ui | UI component library |
| Zustand | State management |
| Framer Motion | Animasi |
| Supabase | Database PostgreSQL + Storage |

---

## Setup Supabase

### 1. Buat Project Supabase
1. Buka [supabase.com](https://supabase.com) dan buat project baru
2. Catat **Project URL** dan **Anon Key** dari Settings → API

### 2. Jalankan SQL untuk Membuat Tabel
Buka Supabase SQL Editor dan jalankan file berikut secara berurutan:

```bash
# Buat tabel orders dan size_prices
supabase/sql/create_tables.sql

# Isi data ukuran & harga
supabase/sql/seed_size_prices.sql
```

### 3. Buat Storage Bucket untuk Bukti Transfer
Di Supabase dashboard:
1. Buka **Storage**
2. Klik **New Bucket**
3. Nama bucket: `payment-proofs`
4. Set **Public** = true

Lalu buka SQL Editor dan jalankan:

```sql
-- Storage policies
CREATE POLICY "Allow public upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-proofs');

CREATE POLICY "Allow authenticated delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'payment-proofs');
```

---

## Instalasi & Menjalankan

### 1. Clone / Download Project

```bash
# Clone repository
git clone <repo-url>
cd pemesanan-seragam-asbd

# Atau download dan extract
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` dan isi:

```env
# Supabase (wajib)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Admin password (wajib)
ADMIN_PASSWORD=your-secure-password

# Service role key (opsional, untuk admin API)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### 5. Build untuk Production

```bash
npm run build
npm start
```

---

## Deploy ke Cloudflare Pages

### Opsi 1: Menggunakan Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Build project
npm run build

# Buat _worker.js di root
cat > _worker.js << 'EOF'
import { handleRequest } from './.next/worker.js';
export default { fetch: handleRequest };
EOF

# Login dan deploy
wrangler login
wrangler pages deploy .vercel/output/static --project-name=pemesanan-asbd
```

### Opsi 2: Menggunakan Git Integration

1. Push kode ke GitHub
2. Buka [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Pages → Create a project → Connect to Git
4. Pilih repository
5. Build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
6. Tambahkan environment variables
7. Deploy

---

## Deploy ke Netlify

### Opsi 1: Netlify CLI

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=.next
```

### Opsi 2: Git Integration

1. Push ke GitHub
2. Buka [Netlify](https://app.netlify.com)
3. Add new site → Import from Git
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Tambahkan environment variables
6. Deploy

---

## Struktur Folder

```
src/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── login/route.ts    # Auth admin
│   │   │   └── orders/route.ts    # CRUD admin orders
│   │   ├── orders/route.ts        # Create order
│   │   └── page.tsx               # (redirect)
│   ├── globals.css                # Tailwind + custom theme
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main page (SPA views)
├── components/
│   ├── admin/
│   │   └── AdminView.tsx          # Admin dashboard
│   ├── landing/
│   │   ├── HeroSection.tsx        # Hero + CTA
│   │   ├── SizeChart.tsx          # Tabel ukuran & harga
│   │   ├── PaymentCard.tsx        # Info rekening
│   │   └── Footer.tsx             # Footer
│   ├── order/
│   │   ├── StepIndicator.tsx      # Progress bar 4 step
│   │   ├── StudentForm.tsx        # Step 1: Data siswa
│   │   ├── ProductForm.tsx        # Step 2: Pilih produk
│   │   ├── PaymentStep.tsx        # Step 3: Info pembayaran
│   │   ├── ConfirmationForm.tsx   # Step 4: Upload bukti
│   │   ├── OrderSummary.tsx       # Sticky summary mobile
│   │   └── SuccessView.tsx        # Halaman sukses
│   └── ui/                        # shadcn/ui components
├── data/
│   └── sizePrices.ts              # Data ukuran & harga
├── lib/
│   ├── store.ts                   # Zustand store
│   ├── supabase.ts                # Supabase client
│   └── utils.ts                   # Utilities (formatRupiah, dll)
└── hooks/
    └── use-toast.ts               # Toast hook

supabase/
├── create_tables.sql              # SQL schema
└── seed_size_prices.sql           # Seed data
```

---

## Catatan

- **Tanpa Supabase**: Aplikasi akan berjalan dalam mode demo dengan data in-memory. Pesanan akan tersimpan selama server aktif.
- **Dengan Supabase**: Semua data disimpan secara persisten di database.
- **Security**: Gunakan anon key untuk frontend. Service role key hanya di server-side (API routes).
- **File Upload**: Bukti transfer divalidasi (JPG/PNG/PDF, maks 5MB).
- **Nomor Order**: Format `ASBD-2026-0001`, auto-increment.
