#!/bin/bash
LOG_FILE="$1"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$BACKEND_DIR")"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# === PRODUCTION PATHS (sesuaikan dengan aaPanel) ===
FRONTEND_DEPLOY="/www/wwwroot/alikhlaskarawang.my.id"
BACKEND_DEPLOY="/www/wwwroot/192.168.110.196/backend"

log() {
  echo "[$(date '+%H:%M:%S')] $1" >> "$LOG_FILE"
}

error_cleanup() {
  log "Error: Proses update gagal!"
}
trap error_cleanup ERR

log "Memulai proses update..."
cd "$PROJECT_DIR" || { log "Gagal masuk ke direktori $PROJECT_DIR"; exit 1; }

log "Git pull..."
git fetch origin main >> "$LOG_FILE" 2>&1
git reset --hard origin/main >> "$LOG_FILE" 2>&1

log "Install backend dependencies..."
cd "$BACKEND_DIR" && timeout 120 npm install --prefer-offline --no-audit --no-fund >> "$LOG_FILE" 2>&1 || true

log "Install frontend dependencies..."
cd "$FRONTEND_DIR" && timeout 120 npm install --prefer-offline --no-audit --no-fund >> "$LOG_FILE" 2>&1 || true

log "Build frontend..."
cd "$FRONTEND_DIR" && timeout 120 npm run build >> "$LOG_FILE" 2>&1 || true

log "Copy frontend build ke $FRONTEND_DEPLOY..."
mkdir -p "$FRONTEND_DEPLOY"
rsync -a --delete "$FRONTEND_DIR/build/" "$FRONTEND_DEPLOY/" >> "$LOG_FILE" 2>&1

log "Copy backend ke $BACKEND_DEPLOY..."
mkdir -p "$BACKEND_DEPLOY"
rsync -a --delete \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='backups' \
  --exclude='uploads' \
  "$BACKEND_DIR/" "$BACKEND_DEPLOY/" >> "$LOG_FILE" 2>&1

log "Install backend dependencies (production)..."
cd "$BACKEND_DEPLOY" && npm install --omit=dev --prefer-offline --no-audit --no-fund >> "$LOG_FILE" 2>&1 || true

log "Update selesai! Restart server via pm2..."
pm2 restart backend --update-env >> "$LOG_FILE" 2>&1

log "Server berhasil direstart"
echo "DONE" >> "$LOG_FILE"
