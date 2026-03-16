#!/usr/bin/env bash
# Forgecraft deployment script — Amazon Linux 2023
set -euo pipefail

APP_DIR="/home/ec2-user/app"
REPO_URL="${REPO_URL:-https://github.com/virend3rp/printmuse-inspiration.git}"

echo "==> Pulling latest code"
if [ -d "$APP_DIR/.git" ]; then
    git -C "$APP_DIR" pull --ff-only
else
    git clone "$REPO_URL" "$APP_DIR"
fi

echo "==> Building backend"
cd "$APP_DIR/backend"
go build -o bin/api ./cmd/api

echo "==> Running database migrations"
goose -dir internal/db/migrations postgres "$DATABASE_URL" up

echo "==> Building frontend"
cd "$APP_DIR/frontend"
npm ci --omit=dev
npm run build

# Copy static assets for standalone mode
cp -r public .next/standalone/public 2>/dev/null || true
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true

echo "==> Installing systemd services"
sudo cp "$APP_DIR/deployment/forgecraft-backend.service"  /etc/systemd/system/
sudo cp "$APP_DIR/deployment/forgecraft-frontend.service" /etc/systemd/system/
sudo systemctl daemon-reload

echo "==> Restarting services"
sudo systemctl enable  forgecraft-backend forgecraft-frontend
sudo systemctl restart forgecraft-backend forgecraft-frontend

echo "==> Installing nginx config"
sudo cp "$APP_DIR/deployment/nginx.conf" /etc/nginx/conf.d/forgecraft.conf
sudo nginx -t
sudo systemctl reload nginx

echo "==> Deploy complete"
sudo systemctl status forgecraft-backend --no-pager
sudo systemctl status forgecraft-frontend --no-pager
