# Pedoman Sistem Informasi Berbasis Website
## Aplikasi Website Sekolah

---

## Daftar Isi
1. [Gambaran Umum](#gambaran-umum)
2. [Arsitektur Aplikasi](#arsitektur-aplikasi)
3. [Struktur Database](#struktur-database)
4. [Fitur-Fitur Utama](#fitur-fitur-utama)
5. [Instalasi dan Konfigurasi](#instalasi-dan-konfigurasi)
6. [Tata Cara Penggunaan Sistem](#tata-cara-penggunaan-sistem)
7. [Prosedur Keamanan dan Autentikasi](#prosedur-keamanan-dan-autentikasi)
8. [Deploy Aplikasi ke Produksi](#deploy-aplikasi-ke-produksi)

---

## Gambaran Umum

Aplikasi Website Sekolah adalah sistem informasi berbasis web yang dirancang untuk memenuhi kebutuhan informasi dan administrasi sebuah institusi pendidikan. Aplikasi ini menyediakan platform bagi sekolah untuk menyampaikan informasi kepada masyarakat, serta memberikan sarana interaksi antara pihak sekolah, guru, dan siswa.

### Tujuan Aplikasi
- Menyediakan informasi sekolah secara online
- Memfasilitasi publikasi berita dan pengumuman sekolah
- Menyediakan galeri kegiatan sekolah
- Memberikan informasi tentang profil sekolah, visi, misi, dan fasilitas
- Menyediakan sistem autentikasi untuk berbagai peran (admin, guru, siswa)

### Teknologi yang Digunakan
- **Frontend**: SvelteKit, TailwindCSS, TypeScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL/MariaDB
- **Server Web**: Apache (untuk deployment produksi)

---

## Arsitektur Aplikasi

Aplikasi ini mengikuti arsitektur berbasis microservices dengan pembagian antara frontend dan backend:

### Frontend (SvelteKit)
- Dibangun menggunakan framework SvelteKit
- Menggunakan TailwindCSS untuk styling
- Mengimplementasikan Single Page Application (SPA)
- Menggunakan Vite sebagai build tool
- Menggunakan adapter-static untuk deployment statis

### Backend (Node.js + Express)
- Server API berbasis Express.js
- Menggunakan MySQL2 untuk koneksi database
- Menggunakan JWT untuk autentikasi
- Menggunakan BCrypt untuk enkripsi password
- Menggunakan Multer untuk upload file

### Komunikasi
- Frontend berkomunikasi dengan backend melalui API RESTful
- Menggunakan CORS untuk mengizinkan permintaan dari domain tertentu
- Proxy konfigurasi di Vite untuk mengarahkan permintaan API ke backend

---

## Struktur Database

Database `school_website` terdiri dari beberapa tabel utama:

### Tabel `users`
- **Deskripsi**: Menyimpan informasi pengguna (admin, guru, siswa)
- **Field**:
  - `id` (INT, AUTO_INCREMENT, PRIMARY KEY): ID unik pengguna
  - `username` (VARCHAR(255), UNIQUE): Username pengguna
  - `password` (VARCHAR(255)): Password terenkripsi
  - `role` (ENUM('admin', 'teacher', 'student')): Peran pengguna
  - `created_at` (TIMESTAMP): Waktu pembuatan akun

### Tabel `categories`
- **Deskripsi**: Menyimpan kategori postingan
- **Field**:
  - `id` (INT, AUTO_INCREMENT, PRIMARY KEY): ID unik kategori
  - `name` (VARCHAR(255), UNIQUE): Nama kategori
  - `slug` (VARCHAR(255), UNIQUE): Slug untuk URL

### Tabel `posts`
- **Deskripsi**: Menyimpan artikel/blog/berita sekolah
- **Field**:
  - `id` (INT, AUTO_INCREMENT, PRIMARY KEY): ID unik postingan
  - `title` (VARCHAR(255)): Judul postingan
  - `content` (TEXT): Isi postingan
  - `author_id` (INT): ID pengguna sebagai penulis
  - `category_id` (INT): ID kategori (foreign key ke tabel categories)
  - `status` (ENUM('draft', 'pending_approval', 'published')): Status postingan
  - `created_at` (TIMESTAMP): Waktu pembuatan
  - `updated_at` (TIMESTAMP): Waktu pembaruan terakhir
  - `published_at` (TIMESTAMP): Waktu publikasi
  - `image_url` (VARCHAR(255)): URL gambar postingan

### Tabel `page_config`
- **Deskripsi**: Menyimpan konfigurasi halaman (header, about, contact, footer)
- **Field**:
  - `id` (INT, AUTO_INCREMENT, PRIMARY KEY): ID unik konfigurasi
  - `page_type` (ENUM('header', 'about', 'contact', 'footer')): Jenis halaman
  - `title` (VARCHAR(255)): Judul halaman
  - `subtitle` (TEXT): Subjudul halaman
  - `description` (TEXT): Deskripsi halaman
  - `sejarah` (TEXT): Sejarah sekolah
  - `visi` (TEXT): Visi sekolah
  - `misi` (TEXT): Misi sekolah
  - `fasilitas` (TEXT): Fasilitas sekolah
  - `kontak` (TEXT): Informasi kontak
  - `image_url` (VARCHAR(255)): URL gambar
  - `cta_link` (VARCHAR(255)): Link call-to-action
  - `status` (ENUM('active', 'inactive')): Status konfigurasi
  - `created_at` (TIMESTAMP): Waktu pembuatan
  - `updated_at` (TIMESTAMP): Waktu pembaruan terakhir

### Tabel `gallery`
- **Deskripsi**: Menyimpan foto-foto galeri kegiatan sekolah
- **Field**:
  - `id` (INT, AUTO_INCREMENT, PRIMARY KEY): ID unik galeri
  - `title` (VARCHAR(255)): Judul foto
  - `description` (TEXT): Deskripsi foto
  - `created_by` (INT): ID pengguna yang mengupload
  - `image_url` (VARCHAR(255)): URL gambar
  - `category` (VARCHAR(100)): Kategori foto
  - `status` (ENUM('active', 'inactive')): Status foto
  - `created_at` (TIMESTAMP): Waktu upload
  - `updated_at` (TIMESTAMP): Waktu pembaruan terakhir

### Tabel `school_info`
- **Deskripsi**: Menyimpan informasi umum sekolah
- **Field**:
  - `id` (INT, AUTO_INCREMENT, PRIMARY KEY): ID unik informasi
  - `school_name` (VARCHAR(255)): Nama sekolah
  - `school_moto` (TEXT): Moto sekolah
  - `logo_url` (VARCHAR(255)): URL logo sekolah
  - `created_at` (TIMESTAMP): Waktu pembuatan
  - `updated_at` (TIMESTAMP): Waktu pembaruan terakhir

### Tabel `settings`
- **Deskripsi**: Menyimpan pengaturan aplikasi
- **Field**:
  - `id` (INT, AUTO_INCREMENT, PRIMARY KEY): ID unik pengaturan
  - `name` (VARCHAR(255), UNIQUE): Nama pengaturan
  - `value` (TEXT): Nilai pengaturan
  - `created_at` (TIMESTAMP): Waktu pembuatan
  - `updated_at` (TIMESTAMP): Waktu pembaruan terakhir

---

## Fitur-Fitur Utama

### 1. Sistem Otentikasi
- Login dan registrasi untuk berbagai peran (admin, guru, siswa)
- Proteksi akses berdasarkan peran pengguna
- Manajemen sesi menggunakan JWT

### 2. Manajemen Konten
- Pembuatan dan pengelolaan postingan/artikel
- Kategorisasi postingan
- Sistem persetujuan postingan (untuk siswa)
- Upload gambar untuk postingan

### 3. Halaman Statis
- Halaman beranda dengan konfigurasi dinamis
- Halaman tentang sekolah (profil, visi, misi, sejarah)
- Halaman kontak
- Halaman galeri foto

### 4. Sistem Komentar dan Interaksi
- (Opsional) Bergantung pada implementasi lebih lanjut

### 5. Dashboard Pengguna
- Tampilan berbeda untuk setiap peran (admin, guru, siswa)
- Manajemen postingan sendiri
- Statistik dasar (jika diperlukan)

### 6. Galeri Media
- Upload dan manajemen foto kegiatan
- Kategorisasi foto
- Tampilan galeri responsif

---

## Instalasi dan Konfigurasi

### Prasyarat
- Node.js (versi 16 atau lebih baru)
- npm atau yarn
- MySQL atau MariaDB
- Apache (untuk deployment produksi)

### Langkah-langkah Instalasi

#### 1. Clone atau download kode sumber
```bash
git clone <alamat-repositori>
cd website
```

#### 2. Instalasi dependensi
```bash
# Instal dependensi root
npm install

# Instal dependensi backend
cd backend
npm install

# Instal dependensi frontend
cd ../frontend
npm install
```

#### 3. Konfigurasi database
- Buat database MySQL/MariaDB dengan nama `school_website`
- Eksekusi skrip `db_schema.sql` untuk membuat struktur tabel

#### 4. Konfigurasi environment
- Di direktori `backend`, buat file `.env` berdasarkan contoh berikut:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123
DB_NAME=school_website
JWT_SECRET=kunci_rahasia_jwt
BACKEND_PORT=3001
```

#### 5. Jalankan aplikasi
```bash
# Untuk development - jalankan dari root direktori
npm run dev

# Atau jalankan masing-masing service
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Tata Cara Penggunaan Sistem

### 1. Peran Admin
- Mengelola pengguna (tambah, edit, hapus)
- Mengelola postingan (publikasi, edit, hapus)
- Mengelola kategori postingan
- Mengelola konfigurasi halaman (header, about, contact, footer)
- Mengelola galeri foto
- Menyetujui postingan dari siswa

### 2. Peran Guru
- Membuat dan mengelola postingan
- Dapat langsung mempublikasikan postingan
- Melihat dan mengedit postingan milik sendiri
- Upload foto ke galeri

### 3. Peran Siswa
- Membuat postingan (akan masuk status pending_approval)
- Dapat menyimpan postingan sebagai draft
- Melihat postingan yang dipublikasikan
- Upload foto ke galeri (tergantung izin)

### 4. Pengguna Umum (Tanpa Login)
- Melihat halaman depan
- Melihat postingan yang dipublikasikan
- Melihat galeri foto
- Melihat informasi sekolah (tentang kami)

---

## Prosedur Keamanan dan Autentikasi

### 1. Otentikasi
- Sistem menggunakan JWT (JSON Web Token) untuk otentikasi
- Token disimpan di client-side dan dikirim dengan setiap permintaan API
- Token memiliki masa berlaku tertentu

### 2. Otorisasi
- Setiap endpoint dilindungi berdasarkan peran pengguna
- Middleware otorisasi memastikan hanya pengguna dengan peran yang sesuai dapat mengakses fitur tertentu

### 3. Enkripsi Password
- Password dienkripsi menggunakan BCrypt sebelum disimpan ke database
- Algoritma hashing yang kuat mencegah pencurian data password

### 4. Validasi Input
- Semua input dari pengguna divalidasi sebelum diproses
- Pencegahan SQL Injection dan XSS

### 5. Hak Akses
- Admin memiliki akses penuh ke semua fitur
- Guru memiliki akses terbatas, hanya ke fitur yang relevan
- Siswa memiliki akses terbatas, terutama untuk fitur publikasi konten

---

## Deploy Aplikasi ke Produksi

### 1. Build Frontend
```bash
cd frontend
npm run build
```

### 2. Deploy ke Web Server
- File-file hasil build ada di direktori `frontend/build`
- Salin file-file tersebut ke document root web server (misalnya `/var/www/html/` di Ubuntu atau `/srv/http/` di Arch Linux)

### 3. Konfigurasi Apache
- File `.htaccess` telah disediakan untuk menangani routing SPA
- Aktifkan mod_rewrite di Apache jika belum aktif

### 4. Jalankan Backend
- Backend harus selalu berjalan agar API dapat diakses
- Gunakan PM2 atau systemd untuk menjaga backend tetap berjalan

### 5. Konfigurasi Reverse Proxy (Opsional)
- Gunakan Nginx atau Apache sebagai reverse proxy untuk mengarahkan permintaan ke backend
- Konfigurasi SSL/TLS untuk koneksi HTTPS

### 6. Backup dan Monitoring
- Lakukan backup database secara berkala
- Monitor kinerja dan keamanan aplikasi
- Update sistem dan dependensi secara rutin

---

## Penutup

Pedoman ini merupakan panduan lengkap untuk memahami, mengelola, dan mengembangkan aplikasi Website Sekolah. Dengan mengikuti pedoman ini, pengguna dapat memaksimalkan potensi aplikasi untuk mendukung kegiatan dan informasi sekolah secara efektif dan efisien.

Untuk pertanyaan lebih lanjut atau bantuan teknis, silakan hubungi tim pengembang atau administrator sistem.