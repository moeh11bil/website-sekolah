#!/bin/bash
LOG_FILE="$1"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="${PROJECT_DIR:-$(dirname "$SCRIPT_DIR")}"
PROJECT_DIR="${PROJECT_DIR:-$(dirname "$BACKEND_DIR")}"
FRONTEND_DIR="${FRONTEND_DIR:-$PROJECT_DIR/frontend}"

FRONTEND_DEPLOY="${FRONTEND_DEPLOY:-}"
BACKEND_DEPLOY="${BACKEND_DEPLOY:-}"

log() {
  echo "[$(date '+%H:%M:%S')] $1" >> "$LOG_FILE"
}

# Pastikan node/npm/pm2 (nvm aaPanel) tersedia di PATH
NVM_BIN=$(ls -d /www/server/nvm/versions/node/*/bin 2>/dev/null | tail -1)
if [ -n "$NVM_BIN" ]; then
  export PATH="$NVM_BIN:$PATH"
fi

# Jalankan pm2 sesuai hak: root langsung; user situs (www) lewat wrapper
# sudoers terbatas /usr/local/bin/pm2-www-restart (hanya jlist & restart
# nama backend) bila tersedia, dengan jatuh balik ke pm2 biasa.
run_pm2() {
  if [ "$(id -u)" -eq 0 ]; then
    pm2 "$@"
    return $?
  fi
  if [ -x /usr/local/bin/pm2-www-restart ] && command -v sudo >/dev/null 2>&1; then
    if sudo -n /usr/local/bin/pm2-www-restart "$@" 2>/dev/null; then
      return 0
    fi
  fi
  pm2 "$@"
}

error_cleanup() {
  log "Error: Proses update gagal!"
}
trap error_cleanup ERR

log "Memulai proses update..."
cd "$PROJECT_DIR" || { log "Gagal masuk ke direktori $PROJECT_DIR"; exit 1; }

log "Git pull..."
# Amankan file .env / .env.production sebelum reset: file-file ini sudah
# tidak dilacak git (berisi rahasia), sehingga `git reset --hard` akan
# menghapusnya dari working tree jika tidak dicadangkan.
ENV_BACKUP_DIR="$(mktemp -d)"
for f in .env .env.production; do
  if [ -f "$BACKEND_DIR/$f" ]; then
    cp "$BACKEND_DIR/$f" "$ENV_BACKUP_DIR/$f"
  fi
done

git fetch origin main >> "$LOG_FILE" 2>&1
git reset --hard origin/main >> "$LOG_FILE" 2>&1

for f in .env .env.production; do
  if [ -f "$ENV_BACKUP_DIR/$f" ]; then
    cp "$ENV_BACKUP_DIR/$f" "$BACKEND_DIR/$f"
    log "Restored $f"
  fi
done
rm -rf "$ENV_BACKUP_DIR"

log "Install backend dependencies..."
cd "$BACKEND_DIR" && timeout 120 npm install --prefer-offline --no-audit --no-fund >> "$LOG_FILE" 2>&1 || true

log "Install frontend dependencies..."
cd "$FRONTEND_DIR" && timeout 120 npm install --prefer-offline --no-audit --no-fund >> "$LOG_FILE" 2>&1 || true

log "Build frontend..."
cd "$FRONTEND_DIR" && timeout 120 npm run build >> "$LOG_FILE" 2>&1 || true

if [ -n "$FRONTEND_DEPLOY" ]; then
  log "Copy frontend build ke $FRONTEND_DEPLOY..."
  mkdir -p "$FRONTEND_DEPLOY"
  rsync -a --delete --exclude='.user.ini' "$FRONTEND_DIR/build/" "$FRONTEND_DEPLOY/" >> "$LOG_FILE" 2>&1
fi

if [ -n "$BACKEND_DEPLOY" ]; then
  log "Copy backend ke $BACKEND_DEPLOY..."
  mkdir -p "$BACKEND_DEPLOY"
  rsync -a --delete \
    --exclude='node_modules' \
    --exclude='.env' \
    --exclude='backups' \
    --exclude='uploads' \
    --exclude='.user.ini' \
    "$BACKEND_DIR/" "$BACKEND_DEPLOY/" >> "$LOG_FILE" 2>&1

  log "Install backend dependencies (production)..."
  cd "$BACKEND_DEPLOY" && npm install --omit=dev --prefer-offline --no-audit --no-fund >> "$LOG_FILE" 2>&1 || true
fi

log "Update selesai! Restart server via pm2..."
# Nama proses pm2 berbeda antar deploy (backend / website-sekolah /
# sekolah-backend). Deteksi berdasarkan path script yang dijalankan agar
# restart selalu kena, dan gagal restart TIDAK diam-diam.
BACKEND_PM2_NAMES=$(run_pm2 jlist 2>/dev/null | node -e '
  try {
    const list = JSON.parse(require("fs").readFileSync(0, "utf8"));
    const names = list
      .filter(p => /backend[\/\\]index\.js$/.test((p.pm2_env && p.pm2_env.pm_exec_path) || ""))
      .map(p => p.name);
    console.log(names.join(" "));
  } catch (e) {
    process.exit(0);
  }
' 2>/dev/null)

restarted=0
for name in $BACKEND_PM2_NAMES; do
  if run_pm2 restart "$name" --update-env >> "$LOG_FILE" 2>&1; then
    log "Backend pm2 '$name' direstart"
    restarted=1
  fi
done

if [ "$restarted" -eq 0 ]; then
  # Cadangan: coba nama umum yang dipakai skrip deploy / panduan
  for name in backend website-sekolah sekolah-backend; do
    if run_pm2 restart "$name" --update-env >> "$LOG_FILE" 2>&1; then
      log "Backend pm2 '$name' direstart"
      restarted=1
      break
    fi
  done
fi

if [ "$restarted" -eq 1 ]; then
  log "Server berhasil direstart"
else
  log "PERINGATAN: tidak menemukan proses pm2 backend - lakukan restart MANUAL!"
fi
echo "DONE" >> "$LOG_FILE"
