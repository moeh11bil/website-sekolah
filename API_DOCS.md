# Deploy Website Sekolah ke Apache di Linux

## Lokasi File Build

File-file build frontend ada di:
```
/home/hilya/Aplikasi/website/frontend/build
```

## Deploy ke Apache di Linux

### 1. Pastikan Apache berjalan
```bash
sudo systemctl enable httpd    # Arch Linux
# atau
sudo systemctl enable apache2  # Ubuntu/Debian
```

```bash
sudo systemctl start httpd     # Arch Linux
# atau
sudo systemctl start apache2   # Ubuntu/Debian
```

### 2. Salin file build ke document root
File-file build sudah disalin ke `/srv/http/` (root directory Apache di Arch Linux) atau `/var/www/html/` (Ubuntu/Debian)

### 3. Konfigurasi Apache
File `.htaccess` sudah dibuat untuk menangani routing SPA (Single Page Application)

### 4. Jalankan backend server

#### Untuk Development (dengan mock server):
```bash
cd /home/hilya/Aplikasi/website/backend
./start-dev.sh
```

Skrip ini akan:
- Memeriksa apakah database (MySQL/MariaDB) berjalan
- Jika berjalan, akan menggunakan database asli
- Jika tidak berjalan, akan menggunakan mock server untuk development

#### Untuk Production (dengan database asli):
```bash
cd /home/hilya/Aplikasi/website/backend
./start-server.sh
```

Skrip ini akan:
- Memeriksa apakah database (MySQL/MariaDB) berjalan
- Jika berjalan, akan menggunakan database asli
- Jika tidak berjalan, akan tetap menjalankan server (akan berjalan tanpa database)

### 5. Akses website
Website bisa diakses di: `http://localhost/`

## Konfigurasi Database (opsional)

Jika kamu ingin menggunakan database asli:

### Untuk Arch Linux (MariaDB):
1. Install MariaDB:
```bash
sudo pacman -S mariadb
```

2. Inisialisasi database (hanya sekali pertama kali):
```bash
sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
```

3. Start dan enable MariaDB:
```bash
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

### Untuk Ubuntu/Debian (MySQL):
1. Install MySQL:
```bash
sudo apt update
sudo apt install mysql-server
```

2. Start dan enable MySQL:
```bash
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Umum untuk semua distro:
1. Set password root (opsional tapi direkomendasikan):
```bash
sudo mysql_secure_installation  # MySQL
# atau
sudo mariadb-secure-installation  # MariaDB
```

2. Buat database untuk aplikasi:
```bash
mysql -u root -p -e "CREATE DATABASE school_website;"  # MySQL
# atau
mariadb -u root -p -e "CREATE DATABASE school_website;"  # MariaDB
```

3. Jalankan migrasi database:
```bash
cd /home/hilya/Aplikasi/website/backend
npm run migrate
```

## File-file Penting

- Frontend build: `/home/hilya/Aplikasi/website/frontend/build/`
- Web root Apache: `/srv/http/` (Arch) atau `/var/www/html/` (Ubuntu/Debian)
- Backend skrip: `/home/hilya/Aplikasi/website/backend/start-dev.sh` dan `start-server.sh`
- Mock server: `/home/hilya/Aplikasi/website/backend/mock-server.js`

## Troubleshooting

Jika website tidak muncul dengan benar:
1. Pastikan Apache berjalan: `sudo systemctl status httpd` atau `sudo systemctl status apache2`
2. Pastikan file-file build ada di direktori web root
3. Pastikan file `index.html` ada di direktori web root
4. Pastikan mock server berjalan di port 3001

Jika API tidak merespon:
1. Pastikan mock server berjalan: `curl http://localhost:3001`
2. Pastikan CORS diatur dengan benar di backend