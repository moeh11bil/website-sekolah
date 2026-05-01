# Deployment Guide - alikhlaskarawang.my.id

## Prerequisites

1. Server dengan Ubuntu/Debian
2. Node.js 18+
3. MySQL 8+
4. Nginx
5. SSL Certificate (Let's Encrypt)
6. PM2 untuk process management

---

## Step 1: Clone & Setup

```bash
# Clone repository
git clone <your-repo-url> /var/www/alikhlaskarawang
cd /var/www/alikhlaskarawang

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

---

## Step 2: Database Setup

```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE sekolah_modern CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sekolah'@'localhost' IDENTIFIED BY 'your-strong-password';
GRANT ALL PRIVILEGES ON sekolah_modern.* TO 'sekolah'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Step 3: Configure Environment Variables

### Backend - `/var/www/alikhlaskarawang/backend/.env`

```bash
NODE_ENV=production
PORT=3001

DOMAIN=alikhlaskarawang.my.id
FRONTEND_URL=https://alikhlaskarawang.my.id
BACKEND_URL=https://alikhlaskarawang.my.id/api

JWT_SECRET=<generate-random-64-char-string>
openssl rand -base64 64

DB_HOST=localhost
DB_PORT=3306
DB_USER=sekolah
DB_PASSWORD=your-strong-password
DB_NAME=sekolah_modern

MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### Frontend - `/var/www/alikhlaskarawang/frontend/.env`

```bash
VITE_API_URL=https://alikhlaskarawang.my.id
VITE_APP_NAME=Sekolah Modern
VITE_APP_URL=https://alikhlaskarawang.my.id
```

---

## Step 4: Database Migration

```bash
cd /var/www/alikhlaskarawang/backend
npm run migrate
```

---

## Step 5: Build Frontend

```bash
cd /var/www/alikhlaskarawang/frontend
npm run build
```

---

## Step 6: PM2 Setup

```bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd /var/www/alikhlaskarawang/backend
pm2 start index.js --name sekolah-backend

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

---

## Step 7: Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/alikhlaskarawang
```

```nginx
# Frontend - Static files
server {
    listen 80;
    server_name alikhlaskarawang.my.id;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name alikhlaskarawang.my.id;

    ssl_certificate /etc/letsencrypt/live/alikhlaskarawang.my.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/alikhlaskarawang.my.id/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/alikhlaskarawang/frontend/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Uploads proxy
    location /uploads {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/alikhlaskarawang /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## Step 8: SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d alikhlaskarawang.my.id

# Auto-renewal test
sudo certbot renew --dry-run
```

---

## Step 9: Firewall Setup

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Step 10: Monitoring & Logs

```bash
# View backend logs
pm2 logs sekolah-backend

# Monitor resources
pm2 monit

# Check backend health
curl https://alikhlaskarawang.my.id/api/health
```

---

## Quick Commands

```bash
# Restart everything
pm2 restart sekolah-backend && sudo systemctl reload nginx

# Update & redeploy
cd /var/www/alikhlaskarawang
git pull
cd backend && npm install && npm run migrate
cd ../frontend && npm install && npm run build
pm2 restart sekolah-backend
```

---

## Troubleshooting

### Backend won't start
```bash
pm2 logs sekolah-backend
# Check .env configuration
```

### Database connection failed
```bash
mysql -u sekolah -p sekolah_modern
# Test connection
```

### CORS errors
- Pastikan `FRONTEND_URL` dan `DOMAIN` di .env sesuai dengan domain Anda
- Pastikan SSL certificate valid

### Static files not loading
```bash
# Check frontend build exists
ls -la /var/www/alikhlaskarawang/frontend/build

# Check nginx root path
```
