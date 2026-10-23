# Deployment Guide — alikhlaskarawang.my.id

Panduan **deploy & update terbaru** untuk Website Sekolah di server produksi (aaPanel + Nginx + MariaDB, di Cloudflare).

---

## 1. Arsitektur Produksi (fakta server)

| Item | Nilai |
|---|---|
| OS / Panel | Ubuntu + **aaPanel** |
| Domain | `alikhlaskarawang.my.id` (Cloudflare di depan) |
| Direktori repo | `/www/wwwroot/alikhlaskarawang.my.id` |
| Nginx vhost | `/www/server/panel/vhost/nginx/alikhlaskarawang.my.id.conf` |
| Root web (frontend) | `/www/wwwroot/alikhlaskarawang.my.id/frontend/build` |
| Proxy API | `/api` → `http://127.0.0.1:3001` |
| Backend (pm2) | nama proses **`website-sekolah`**, script `backend/index.js`, user `www` |
| Node | **v24.18.0** via aaPanel nvm (`/www/server/nvm/versions/node/.../bin`) |
| Database | MariaDB, db **`sekolah_modern`**, user `website_db` |
| Git remote | `https://github.com/moeh11bil/website-sekolah.git` (branch `main`) |

> Jalur `node/npm/pm2`: tambahkan `/www/server/nvm/versions/node/<versi>/bin` ke `PATH` bila perintah dijalankan dari shell non-interaktif (SSH/skrip).

---

## 2. Update via Dashboard (METODE UTAMA — otomatis & aman)

Di halaman **Dashboard → Update**, klik tombol **Update**. Ini menjalankan `backend/scripts/update.sh` sebagai user `www` dengan alur:

1. **Cadangan** ke `backend/backups/update/`:
   - salinan `.env` & `.env.production`
   - snapshot kode (`git archive` → `repo-<commit>-<ts>.tar.gz`)
   - rotasi: simpan **5 cadangan terbaru** per jenis
2. `git fetch origin main` + `git reset --hard origin/main`
3. `npm install` backend & frontend
4. `npm run build` frontend — **wajib sukses** (dicek `build/index.html`)
5. **Restart** backend via pm2
6. `DONE` (status sukses di UI)

### Auto-rollback
Jika **build gagal**, skrip otomatis:
- `git reset --hard` ke commit sebelum update,
- pulihkan `.env` dari cadangan,
- build ulang dari kode lama,
- restart backend,
- menandai status **`ROLLBACK`** (exit 1).

Jadi situs **tidak akan tinggal rusak** — selalu kembali ke versi terakhir yang jalan.

### Prasyarat agar tombol Update berfungsi
- Repo dimiliki `www:www`:
  ```bash
  chown -R www:www /www/wwwroot/alikhlaskarawang.my.id
  ```
- Git mempercayai direktori repo (sekali saja):
  ```bash
  git config --system --add safe.directory /www/wwwroot/alikhlaskarawang.my.id
  ```
- Wrapper sudoers **terbatas** agar `www` bisa merestart pm2 milik root:
  `/usr/local/bin/pm2-www-restart` — **hanya** mengizinkan
  `pm2 jlist` dan `pm2 restart <backend|website-sekolah|sekolah-backend>`.
  Dipasang lewat `/etc/sudoers.d/pm2-www` (`NOPASSWD`). Subcommand lain
  (`stop`, `start`) dan nama aplikasi lain **ditolak** (bukan eskalasi ke root).
- `update.sh` memanggil wrapper ini lewat fungsi `run_pm2` (root → pm2 langsung; www → wrapper, fallback pm2 biasa).

---

## 3. Update manual via SSH (cadangan / darurat)

Gunakan bila dashboard tidak tersedia. Jalankan sebagai user dengan hak tulis ke repo.

```bash
cd /www/wwwroot/alikhlaskarawang.my.id

# (opsional, pengaman) cadangkan .env
mkdir -p /root/env-backup && cp -a backend/.env /root/env-backup/.env

git fetch origin main
git reset --hard origin/main

# .env kini tidak dilacak git sehingga aman, tetapi bila ikut hilang: pulihkan
[ -f backend/.env ] || cp -a /root/env-backup/.env backend/.env

npm install --prefix backend --omit=dev --no-audit --no-fund
npm install --prefix frontend --no-audit --no-fund
(cd frontend && npm run build)

# restart pm2 (nama proses: website-sekolah)
pm2 restart website-sekolah --update-env
```

Verifikasi:
```bash
curl -s http://127.0.0.1:3001/api/auth/me            # → 401 (tanpa token = wajar)
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3001/api/analytics/summary   # → 200
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: alikhlaskarawang.my.id' http://127.0.0.1/   # → 200
pm2 status | grep website-sekolah                     # → online
```

> **Jangan** `git pull` polos. Gunakan `fetch` + `reset --hard` agar konflik lokal tak
> menggagalkan update; `.env` tidak dilacak git jadi tak ikut terhapus.

---

## 4. Deploy awal (server baru / instalasi pertama)

Jalankan `deploy.sh` (sekali jalan) sebagai root:

```bash
cd /www/wwwroot/alikhlaskarawang.my.id   # atau lokasi clone
bash deploy.sh
```

Urutan `deploy.sh` (7 langkah):

1. Clone repo (bila direktori sudah ada: `git pull` **dengan** cadangan-restore `.env`)
2. `npm install --production` (backend)
3. `npm install` + `npm run build` (frontend)
4. Buat `backend/.env` **bila belum ada** → berhenti & minta Anda mengedit `DB_PASSWORD` + `JWT_SECRET`
5. `CREATE DATABASE IF NOT EXISTS sekolah_modern` + impor `backend/db_schema.sql`
6. `pm2 start index.js --name website-sekolah` + `pm2 save` + `pm2 startup`
7. Mencetak petunjuk akhir: buat site di aaPanel (root `frontend/build`, PHP: None), tambahkan blok `location /api/` + `/uploads/` proxy ke `127.0.0.1:3001`, aktifkan SSL.

> **Catatan clone**: `REPO_URL` di `deploy.sh` memakai SSH (`git@github.com:...`) sehingga perlu
> kunci GitHub di server. Bila tak ada, clone manual via HTTPS lalu lanjutkan langkah 2–7:
> `git clone https://github.com/moeh11bil/website-sekolah.git /www/wwwroot/alikhlaskarawang.my.id`

Setelah deploy awal, pembaruan selanjutnya cukup pakai **tombol Update dashboard** (bagian 2).

Database manual (jika perlu):
```bash
mysql -u root -p < backend/db_schema.sql     # CREATE TABLE IF NOT EXISTS — aman diulang
# atau
cd backend && npm run migrate
```

---

## 5. Environment Variables Produksi

Berkas: `/www/wwwroot/alikhlaskarawang.my.id/backend/.env` (milik `www:www`, **tidak di-git**).

```bash
NODE_ENV=production
PORT=3001
DOMAIN=alikhlaskarawang.my.id
FRONTEND_URL=https://alikhlaskarawang.my.id
BACKEND_URL=https://alikhlaskarawang.my.id/api

DB_HOST=localhost
DB_PORT=3306
DB_USER=website_db
DB_PASSWORD=<rahasia>
DB_NAME=sekolah_modern

JWT_SECRET=<64-hex acak>
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

- Buat acak: `openssl rand -hex 32`
- **Rotasi `JWT_SECRET`** mengeluarkan semua sesi login (pengguna diminta login ulang).
  Lakukan bila secret pernah bocor/ter-commit.

---

## 6. Backup & Pemulihan

Cadangan otomatis ada di `backend/backups/update/`:

```bash
ls -la /www/wwwroot/alikhlaskarawang.my.id/backend/backups/update/
#   .env.<ts>                       salinan .env
#   .env.production.<ts>            salinan .env.production
#   repo-<commit>-<ts>.tar.gz       snapshot kode saat itu
```

Pulihkan:
```bash
cd /www/wwwroot/alikhlaskarawang.my.id
# kode dari snapshot
tar -xzf backend/backups/update/repo-<commit>-<ts>.tar.gz -C .
# atau dari git (commit lama masih ada di repo)
git reset --hard <commit-lama>
# konfigurasi
cp backend/backups/update/.env.<ts> backend/.env
chown www:www backend/.env
```

Backup database (jadwal, mis. cron):
```bash
mysqldump -u website_db -p sekolah_modern | gzip > /root/backup/sekolah_$(date +%F).sql.gz
```

Berkas `backend/backups/` sudah masuk `.gitignore` (tidak ikut ter-commit).

---

## 7. Monitoring & Troubleshooting

```bash
export PATH=/www/server/nvm/versions/node/<versi>/bin:$PATH

pm2 status | grep website-sekolah        # status proses
pm2 logs website-sekolah --lines 100     # log runtime
tail -50 /root/.pm2/logs/website-sekolah-error.log
```

| Gejala | Penyebab / solusi |
|---|---|
| Halaman update menampilkan error `git rev-parse` / "dubious ownership" | `safe.directory` belum diset → jalankan perintah prasyarat pada bagian 2 |
| Tombol Update: `PERINGATAN ... lakukan restart MANUAL` | wrapper sudoers tidak ada / pm2 tak terdeteksi → cek `/usr/local/bin/pm2-www-restart` & `sudo -n` utk `www` |
| Situs 502 / API mati | `pm2 status`, cek log, pastikan port 3001 terbuka |
| Build frontend gagal | log `backend/backups/update/`? Tidak — cek log Update; skrip akan auto-ROLLBACK ke versi lama |
| Perubahan tak muncul | pastikan `frontend/build` ikut ter-build & nginx root mengarah ke `frontend/build` |
| 401 padahal sudah login | token kedaluwarsa → login ulang (fitur paksa-logout memang begini) |

---

## 8. Catatan Keamanan

- `.env` **tidak pernah** di-commit (sudah di-untrack). Simpan rahasia hanya di server.
- Jangan `git pull` polos; selalu `fetch` + `reset --hard` (lihat bagian 3).
- Wrapper sudoers **hanya** `jlist`/`restart` 3 nama backend — tidak memberi `www` akses root penuh.
- Repo `www:www` berarti proses `www` bisa menulis kode aplikasi (prasyarat update dari dashboard). Ini normal untuk setup aaPanel, tetapi sadari: kompromi pada `www` = kendali atas aplikasi ini (bukan root server).
- Rotasi `JWT_SECRET` & update `npm` dependensi secara berkala.
