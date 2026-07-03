#!/bin/sh
set -e
export PATH="/app/node_modules/.bin:$PATH"
echo "[entrypoint] Generating Prisma client..."
prisma generate
echo "[entrypoint] Applying database migrations..."
prisma migrate deploy
echo "[entrypoint] Seeding database..."
tsx prisma/seed.ts
echo "[entrypoint] Starting backend..."
exec npm run dev
