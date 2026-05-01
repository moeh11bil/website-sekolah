# Aplikasi Website Sekolah

Selamat! Database untuk aplikasi website sekolah Anda telah berhasil dimigrasi dan siap digunakan.

## Status Aplikasi

- **Backend**: Berjalan di http://localhost:3001
- **Frontend**: Siap dijalankan di http://localhost:5173 (akan otomatis terbuka saat dijalankan)

## Struktur Database

Database `school_website` telah dibuat dengan tabel-tabel berikut:

1. `users` - untuk manajemen akun pengguna (admin, guru, siswa)
2. `categories` - untuk kategori postingan
3. `posts` - untuk artikel/blog
4. `page_config` - untuk konfigurasi halaman (header, about, contact, footer)
5. `gallery` - untuk galeri foto
6. `settings` - untuk pengaturan aplikasi

## Data Awal

- Telah dimasukkan 3 akun pengguna default:
  - admin (password: default)
  - teacher1 (password: default)
  - student1 (password: default)
- Telah dimasukkan 3 kategori default:
  - Pengumuman
  - Kegiatan Sekolah
  - Opini Siswa

## Cara Menjalankan Aplikasi

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm run dev
```

### Menjalankan Kedua Aplikasi (Satu Perintah)
Anda bisa menjalankan kedua aplikasi sekaligus dengan satu perintah dari root direktori:

```bash
npm run dev
```

Perintah ini akan menjalankan backend dan frontend secara bersamaan.

Frontend akan otomatis membuka browser di http://localhost:5173

## Konfigurasi Database

Kredensial database:
- Host: localhost
- User: root
- Password: 123
- Database: school_website

Konfigurasi ini telah disimpan di file `.env` di direktori backend.

## Catatan Penting

1. Pastikan MariaDB berjalan sebelum menjalankan aplikasi
2. Untuk keamanan di lingkungan produksi, ubah password default di file `.env`
3. API endpoint tersedia di `/api/*` dan akan diprosxy ke backend
4. Konfigurasi proxy frontend telah disetel untuk menghubungkan ke backend di http://localhost:3001