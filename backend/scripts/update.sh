#!/bin/bash
LOG_FILE="$1"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="${PROJECT_DIR:-$(dirname "$SCRIPT_DIR")}"
PROJECT_DIR="${PROJECT_DIR:-$(dirname "$BACKEND_DIR")}"
FRONTEND_DIR="${FRONTEND_DIR:-$PROJECT_DIR/frontend}"

FRONTEND_DEPLOY="${FRONTEND_DEPLOY:-}"
BACKEND_DEPLOY="${BACKEND_DEPLOY:-}"

# Cadangan persisten sebelum reset (di luar repo kerja, agar tak ikut ter-reset)
UPDATE_BACKUP_DIR="${UPDATE_BACKUP_DIR:-$BACKEND_DIR/backups/update}"

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

# Deteksi & restart proses pm2 backend (nama berbeda antar deploy).
# Kembalikan 0 bila minimal satu proses berhasil direstart.
restart_backend() {
  local restarted=0 name names
  names=$(run_pm2 jlist 2>/dev/null | node -e '
    try {
      const list = JSON.parse(require("fs").readFileSync(0, "utf8"));
      const n = list
        .filter(p => /backend[\/\\]index\.js$/.test((p.pm2_env && p.pm2_env.pm_exec_path) || ""))
        .map(p => p.name);
      console.log(n.join(" "));
    } catch (e) { process.exit(0); }
  ' 2>/dev/null)

  for name in $names; do
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

  [ "$restarted" -eq 1 ]
}

rollback_done=0
# Kembalikan kode + .env ke kondisi sebelum update, build ulang, restart.
# Dipakai otomatis bila build frontend gagal agar situs tak tinggal rusak.
rollback_and_exit() {
  if [ "$rollback_done" -eq 1 ]; then exit 1; fi
  rollback_done=1
  trap - ERR   # cegah rekursi lewat trap ERR

  log "=== ROLLBACK: update gagal, mengembalikan versi sebelumnya ==="
  if [ -n "$PREV_COMMIT" ]; then
    git reset --hard "$PREV_COMMIT" >> "$LOG_FILE" 2>&1
    log "Kode dikembalikan ke commit $PREV_COMMIT"
  fi
  for f in .env .env.production; do
    if [ -f "$UPDATE_BACKUP_DIR/$f.$TS" ]; then
      cp "$UPDATE_BACKUP_DIR/$f.$TS" "$BACKEND_DIR/$f"
      log "Rollback: $f dipulihkan dari cadangan"
    fi
  done

  if [ -d "$FRONTEND_DIR" ]; then
    log "Rollback: build ulang frontend dari kode lama..."
    ( cd "$FRONTEND_DIR" && npm run build >> "$LOG_FILE" 2>&1 )
  fi
  if restart_backend; then
    log "Rollback: backend direstart"
  else
    log "Rollback: PERINGATAN restart backend gagal - restart MANUAL!"
  fi

  log "Rollback selesai. Situs berjalan di commit lama: ${PREV_COMMIT:-unknown}"
  echo "ROLLBACK" >> "$LOG_FILE"
  exit 1
}

error_cleanup() {
  log "Error: Proses update gagal!"
}
trap error_cleanup ERR

log "Memulai proses update..."
cd "$PROJECT_DIR" || { log "Gagal masuk ke direktori $PROJECT_DIR"; exit 1; }

# Catat commit sebelum update (untuk rollback) lalu buat cadangan persisten.
PREV_COMMIT="$(git rev-parse HEAD 2>/dev/null || echo '')"
TS="$(date '+%Y%m%d-%H%M%S')"
mkdir -p "$UPDATE_BACKUP_DIR"

log "Membuat cadangan ke $UPDATE_BACKUP_DIR ..."
for f in .env .env.production; do
  if [ -f "$BACKEND_DIR/$f" ]; then
    cp "$BACKEND_DIR/$f" "$UPDATE_BACKUP_DIR/$f.$TS" && log "Cadangan $f.$TS"
  fi
done
if [ -n "$PREV_COMMIT" ]; then
  if git archive --format=tar.gz -o "$UPDATE_BACKUP_DIR/repo-$PREV_COMMIT-$TS.tar.gz" HEAD >> "$LOG_FILE" 2>&1; then
    log "Cadangan arsip kode repo-$PREV_COMMIT-$TS.tar.gz"
  else
    log "PERINGATAN: arsip kode gagal dibuat (lanjut tanpa arsip)"
  fi
fi
# Rotasi: simpan 5 cadangan terbaru per jenis. Pola .env.[0-9]* hanya
# cocokkan .env.<timestamp> sehingga tak tumpang-tindih dengan .env.production.*
ls -1t "$UPDATE_BACKUP_DIR"/repo-*.tar.gz        2>/dev/null | tail -n +6 | xargs -r rm -f
ls -1t "$UPDATE_BACKUP_DIR"/.env.[0-9]*           2>/dev/null | tail -n +6 | xargs -r rm -f
ls -1t "$UPDATE_BACKUP_DIR"/.env.production.[0-9]* 2>/dev/null | tail -n +6 | xargs -r rm -f

log "Git pull..."
# .env kini tidak dilacak git; cadangan di atas tetap dipertahankan sebagai
# jaring pengaman bila suatu saat file ini kembali ter-lacak git.
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
cd "$BACKEND_DIR" && timeout 180 npm install --prefer-offline --no-audit --no-fund >> "$LOG_FILE" 2>&1 || true

log "Install frontend dependencies..."
cd "$FRONTEND_DIR" && timeout 180 npm install --prefer-offline --no-audit --no-fund >> "$LOG_FILE" 2>&1 || true

# Build frontend WAJIB sukses; kalau gagal situs tinggal rusak -> rollback.
log "Build frontend..."
cd "$FRONTEND_DIR"
if ! timeout 180 npm run build >> "$LOG_FILE" 2>&1 || [ ! -f "$FRONTEND_DIR/build/index.html" ]; then
  log "Build frontend GAGAL!"
  rollback_and_exit
fi
log "Build frontend sukses"

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
if restart_backend; then
  log "Server berhasil direstart"
else
  log "PERINGATAN: tidak menemukan proses pm2 backend - lakukan restart MANUAL!"
fi
echo "DONE" >> "$LOG_FILE"
