#!/bin/bash
set -e

# ============================================
# DEPLOY SCRIPT - Website Sekolah
# Untuk server aaPanel dengan PM2 + Nginx
# ============================================

# Konfigurasi
DOMAIN="alikhlaskarawang.my.id"
DEPLOY_DIR="/www/wwwroot/$DOMAIN"
REPO_URL="git@github.com:moeh11bil/website-sekolah.git"
DB_NAME="sekolah_modern"

echo "=========================================="
echo "  DEPLOY: $DOMAIN"
echo "=========================================="

# 1. Clone atau pull repository
echo ""
echo "[1/7] Cloning repository..."
if [ -d "$DEPLOY_DIR" ]; then
    cd "$DEPLOY_DIR"
    git pull origin main
else
    git clone "$REPO_URL" "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
fi

# 2. Install dependencies backend
echo ""
echo "[2/7] Installing backend dependencies..."
cd "$DEPLOY_DIR/backend"
npm install --production

# 3. Install dependencies & build frontend
echo ""
echo "[3/7] Installing frontend dependencies..."
cd "$DEPLOY_DIR/frontend"
npm install

echo ""
echo "[4/7] Building frontend..."
npm run build

# 4. Setup environment file
echo ""
echo "[5/7] Setting up environment..."
cd "$DEPLOY_DIR/backend"
if [ ! -f .env ]; then
    cat > .env << 'EOF'
PORT=3001
NODE_ENV=production
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=ISI_PASSWORD_MYSQL
DB_NAME=sekolah_modern
JWT_SECRET=ISI_SECRET_YANG_KUAT_MINIMAL_32_KARAKTER
FRONTEND_URL=https://alikhlaskarawang.my.id
DOMAIN=alikhlaskarawang.my.id
EOF
    echo "  ⚠️  File .env dibuat! Edit password & JWT_SECRET:"
    echo "     nano $DEPLOY_DIR/backend/.env"
    echo ""
    read -p "  Tekan Enter setelah edit .env..."
fi

# 5. Setup database
echo ""
echo "[6/7] Setting up database..."
if command -v mysql &> /dev/null; then
    mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>/dev/null || true
    if [ -f "$DEPLOY_DIR/backend/db_schema.sql" ]; then
        mysql -u root -p "$DB_NAME" < "$DEPLOY_DIR/backend/db_schema.sql" 2>/dev/null || true
    fi
    echo "  ✅ Database siap"
else
    echo "  ⚠️  MySQL tidak ditemukan via CLI. Import manual via aaPanel"
fi

# 6. Setup PM2
echo ""
echo "[7/7] Starting with PM2..."
cd "$DEPLOY_DIR/backend"
pm2 delete website-sekolah 2>/dev/null || true
pm2 start index.js --name website-sekolah
pm2 save
pm2 startup 2>/dev/null || true

echo ""
echo "=========================================="
echo "  ✅ DEPLOY BERHASIL!"
echo "=========================================="
echo ""
echo "  Backend:  http://localhost:3001"
echo "  Frontend: /www/wwwroot/$DOMAIN/frontend/build"
echo ""
echo "  SELANJUTNYA:"
echo "  1. Buka aaPanel → Website → Add Site"
echo "     - Domain: $DOMAIN"
echo "     - Root: $DEPLOY_DIR/frontend/build"
echo "     - PHP: None"
echo ""
echo "  2. Edit Nginx config, tambahkan:"
echo "     location /api/ {"
echo "         proxy_pass http://127.0.0.1:3001;"
echo "         proxy_http_version 1.1;"
echo "         proxy_set_header Host \$host;"
echo "         proxy_set_header X-Real-IP \$remote_addr;"
echo "     }"
echo "     location /uploads/ {"
echo "         proxy_pass http://127.0.0.1:3001;"
echo "     }"
echo ""
echo "  3. Aktifkan SSL (Let's Encrypt) di aaPanel"
echo ""
echo "  Status: pm2 status"
echo "  Logs:   pm2 logs website-sekolah"
echo "=========================================="
