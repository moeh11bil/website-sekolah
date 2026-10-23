# Website Sekolah — Sekolah Modern Al Ma'ruf

Sistem informasi berbasis web untuk sekolah: profil, blog/berita, galeri, dan dashboard konten dengan tiga peran (admin, guru, siswa). Produksi: **https://alikhlaskarawang.my.id**

## Teknologi

| Lapisan | Teknologi |
|---|---|
| Frontend | SvelteKit + TypeScript + TailwindCSS, `adapter-static` (SPA) → output `frontend/build` |
| Backend | Node.js + Express (REST API `/api/*`), port **3001** |
| Database | MySQL/MariaDB (produksi: MariaDB, db `sekolah_modern`) |
| Proses | **pm2** (nama proses: `website-sekolah`) |
| Web server | **Nginx** (aaPanel) — root `frontend/build`, proxy `/api` → `127.0.0.1:3001` |
| CDN/SSL | Cloudflare di depan domain |

## Struktur Direktori

```
├── frontend/               # Aplikasi SvelteKit (npm run dev → :5173)
│   └── build/              # Hasil build produksi (di-serve nginx)
├── backend/                # API Express (npm run dev → :3001)
│   ├── index.js            # Entry server
│   ├── routes/             # Endpoint API (auth, posts, gallery, analytics, update, ...)
│   ├── db_schema.sql       # Skema database
│   ├── scripts/update.sh   # Skrip update (dijalankan tombol Update dashboard)
│   └── backups/            # Cadangan update (.env + snapshot kode) — di-gitignore
├── deploy.sh               # Instal/deploy awal
└── docs (README, DEPLOYMENT_GUIDE, PEDOMAN_*)
```

## Menjalankan untuk Development

Prasyarat: Node.js 18+, MySQL/MariaDB berjalan.

```bash
# 1. Instal dependensi
npm install
npm install --prefix backend
npm install --prefix frontend

# 2. Buat database + skema
mysql -u root -p < backend/db_schema.sql
# atau: cd backend && npm run migrate

# 3. Konfigurasi backend/.env  (lihat bagian Environment)
#    DB_* , PORT=3001, JWT_SECRET, dll.

# 4. Jalankan backend + frontend sekaligus (dari root)
npm run dev
#   Backend  → http://localhost:3001
#   Frontend → http://localhost:5173  (proxy /api ke :3001)
```

Perintah terpisah:
- Backend (reload otomatis): `cd backend && npm run dev`  *(nodemon)*
- Frontend: `cd frontend && npm run dev`
- Build frontend: `cd frontend && npm run build`

### Environment (`backend/.env`)

```bash
NODE_ENV=production
PORT=3001
DOMAIN=alikhlaskarawang.my.id
FRONTEND_URL=https://alikhlaskarawang.my.id

DB_HOST=localhost
DB_PORT=3306
DB_USER=<user>
DB_PASSWORD=<rahasia>
DB_NAME=sekolah_modern

JWT_SECRET=<64-char acak: openssl rand -hex 32>
```

> `.env` **tidak** di-commit ke git (sudah di-untrack). Jangan pernah commit berkas ini.
> Di produksi, `.env` hidup di `backend/.env` server dan selalu dipertahankan saat update.

## Fitur Utama

- **Autentikasi & sesi** — login JWT 3 peran (admin/teacher/student). Saat token kedaluwarsa: paksa logout + banner "sesi berakhir" (4 lapis pengecekan: saat init, tiap 15 d, interceptor global 401, guard dashboard).
- **Konten** — postingan/blog dengan alur persetujuan (siswa → pending → publish), kategori, gambar.
- **Halaman dinamis** — header/about/contact/footer (`page_config`), `school_info`, `quick_links`, `staff_testimonials`.
- **Galeri** — upload & kategorisasi foto.
- **Analitik pengunjung** — hitungan kunjungan + pengunjung unik (`page_views`, dibuat otomatis saat pertama dipakai). Tampil di kartu statistik beranda + dashboard admin (dengan tombol reset).
- **Update dari dashboard** — tombol Update menarik kode terbaru lalu build & restart otomatis, lengkap dengan **cadangan + auto-rollback** (jika build gagal, kode dikembalikan ke versi sebelumnya).

## Dokumentasi Lain

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** — cara deploy & update **terbaru** (aaPanel/nginx + tombol Update dashboard).
- **[PEDOMAN_SISTEM_INFORMASI.md](./PEDOMAN_SISTEM_INFORMASI.md)** — referensi teknis sistem (arsitektur, skema DB, keamanan).
- **[PEDOMAN_SISTEM_INFORMASI_FORMAT_BARU.md](./PEDOMAN_SISTEM_INFORMASI_FORMAT_BARU.md)** — pedoman penggunaan untuk sekolah (dokumen resmi).

## Akun Bawaan (sekali instal)

`db_schema.sql` menyisipkan akun awal dengan password ter-hash default. **Segera ganti** setelah instalasi:

| Username | Peran |
|---|---|
| `admin` | admin |
| `teacher1` | teacher |
| `student1` | student |
