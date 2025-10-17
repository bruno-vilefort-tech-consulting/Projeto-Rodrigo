#!/usr/bin/env bash
set -euo pipefail

EMPRESA="${EMPRESA:?}"
DEPLOY_PASS="${DEPLOY_PASS:?}"
ADMIN_EMAIL="${ADMIN_EMAIL:?}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:?}"
BACKEND_HOST="${BACKEND_HOST:?}"
FRONTEND_HOST="${FRONTEND_HOST:?}"
BACKEND_PORT="${BACKEND_PORT:?}"
FRONTEND_PORT="${FRONTEND_PORT:?}"

BASE="/home/deploy/${EMPRESA}"
log(){ echo "[postinstall] $*"; }

# 1) Usuário deploy + PM2
if ! id deploy &>/dev/null; then
  useradd -m -s /bin/bash deploy
  echo "deploy ALL=(ALL) NOPASSWD:ALL" >/etc/sudoers.d/deploy_nopasswd
fi
su - deploy -c "corepack enable || true; npm -v >/dev/null 2>&1 || curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -; sudo apt-get install -y nodejs; npm i -g pm2"

# 2) Redis e Postgres (idempotente)
apt-get update -y -qq
apt-get install -y -qq redis-server postgresql || true
systemctl enable --now redis-server postgresql || true

# DB/role (idempotente)
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${EMPRESA}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE ROLE ${EMPRESA} LOGIN PASSWORD '${DEPLOY_PASS}';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${EMPRESA}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE ${EMPRESA} OWNER ${EMPRESA};"

# 3) Permissões do código
install -d -m 0755 "$BASE"
chown -R deploy:deploy "$BASE"

# 4) PM2 – subir apps (usando artefatos já extraídos pelo instalador)
su - deploy -c "cd '$BASE/backend'  && pm2 start dist/server.js --name ${EMPRESA}-backend -i 2 --update-env || true"
su - deploy -c "cd '$BASE/frontend' && pm2 start server.js      --name ${EMPRESA}-frontend --update-env || true"
su - deploy -c "pm2 save"

# 5) Nginx como proxy (HTTP) + (opcional) Certbot
cat >/etc/nginx/sites-available/${EMPRESA}-backend <<NGINX
server {
  listen 80;
  server_name ${BACKEND_HOST};
  location / {
    proxy_pass http://127.0.0.1:${BACKEND_PORT};
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
NGINX

cat >/etc/nginx/sites-available/${EMPRESA}-frontend <<NGINX
server {
  listen 80;
  server_name ${FRONTEND_HOST};
  location / {
    proxy_pass http://127.0.0.1:${FRONTEND_PORT};
    proxy_set_header Host \$host;
    proxy_http_version 1.1;
  }
}
NGINX

ln -sfn /etc/nginx/sites-available/${EMPRESA}-backend  /etc/nginx/sites-enabled/${EMPRESA}-backend
ln -sfn /etc/nginx/sites-available/${EMPRESA}-frontend /etc/nginx/sites-enabled/${EMPRESA}-frontend
[ -e /etc/nginx/sites-enabled/default ] && rm -f /etc/nginx/sites-enabled/default || true
nginx -t && systemctl restart nginx

# SSL automático (opcional; exige DNS ok)
if command -v certbot >/dev/null 2>&1; then
  certbot --nginx -d "${BACKEND_HOST}" -d "${FRONTEND_HOST}" --non-interactive --agree-tos --email "${ADMIN_EMAIL}" || \
    log "WARN: certbot falhou; rode manualmente depois."
fi

log "Pós-instalação finalizada."
