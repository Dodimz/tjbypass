# MentorLMS Production Deployment Guide

## Arsitektur

```
GitHub (push main)
   └─► GitHub Actions: test → SSH ke VPS → git pull + docker compose up -d --build
```

Services di `docker-compose.prod.yaml`:

| Service | Peran |
|---|---|
| `nginx` | Web server, menyajikan `public/` + asset hasil build (ter-bake di image) |
| `php` | PHP-FPM 8.3, kode + vendor ter-bake di image |
| `queue` | Worker `queue:work redis` |
| `scheduler` | `schedule:run` tiap 60 detik |
| `mysql` | MySQL 8.0 + volume `mysql_data` |
| `redis` | Cache/session/queue + volume `redis_data` |
| `backup` *(opsional)* | Dump harian ke volume `backups`, retensi 7 hari |

Upload user tersimpan di volume `app_storage`, log di `app_logs` — keduanya bertahan antar-deploy.

## Setup Pertama Kali (sekali saja)

### 1. VPS
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone repo & siapkan environment
git clone <repo-url> /opt/tjbypass && cd /opt/tjbypass
cp .env.production.example .env.production && nano .env.production
#   - APP_KEY: php artisan key:generate --show  (jalankan di laptop)
#   - APP_URL, DB_PASSWORD, SMTP, domain

nano docker/env/mysql.prod.env   # password MySQL yang kuat
```

### 2. GitHub Secrets (Settings → Secrets and variables → Actions)

| Secret | Isi contoh |
|---|---|
| `SSH_HOST` | `203.0.113.10` atau domain VPS |
| `SSH_USER` | `deploy` / `root` |
| `SSH_PRIVATE_KEY` | Private key (`cat ~/.ssh/id_ed25519`) |
| `SSH_PORT` | `22` (opsional) |
| `DEPLOY_PATH` | `/opt/tjbypass` |

Public key harus ada di `~/.ssh/authorized_keys` VPS.

### 3. Deploy pertama
```bash
docker compose -f docker-compose.prod.yaml up -d --build --wait
```
Lalu buka `http://IP-VPS` dan selesaikan **installer web** (migrasi dilakukan installer).

## Alur Update Harian

Cukup:
```bash
git push origin main
```
Actions menjalankan test dulu; jika lolos → otomatis pull + rebuild + migrate di VPS.

Deploy manual darurat: jalankan workflow "Deploy Production" dari tab Actions (`workflow_dispatch`).

## HTTPS

Config nginx saat ini HTTP saja. Opsi:
1. **Cloudflare** (paling mudah): arahkan DNS ke Cloudflare, aktifkan proxy → SSL otomatis.
2. **Reverse proxy** (Caddy/Traefik) di depan nginx.
3. Tambahkan blok SSL manual di `docker/config/nginx.conf`.

## Perintah Berguna

```bash
cd /opt/tjbypass

docker compose -f docker-compose.prod.yaml ps                # status
docker compose -f docker-compose.prod.yaml logs -f php       # log aplikasi
docker compose -f docker-compose.prod.yaml exec php sh       # masuk container

# Backup on-demand
docker compose -f docker-compose.prod.yaml exec mysql \
  sh -c 'mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' > backup.sql

# Rollback versi kode
git checkout <commit-sebelumnya>
docker compose -f docker-compose.prod.yaml up -d --build
```

## Checklist

- [ ] `.env.production`: `APP_DEBUG=false`, APP_KEY unik, APP_URL benar
- [ ] `mysql.prod.env`: password kuat (file ini TIDAK ikut git)
- [ ] Repo GitHub bersifat **private**
- [ ] Firewall VPS: hanya port 22, 80, 443 yang terbuka (MySQL/Redis tidak dipublish ke luar)
- [ ] Deploy pertama sukses + installer selesai
- [ ] Profile backup aktif: `docker compose -f docker-compose.prod.yaml --profile backup up -d`
