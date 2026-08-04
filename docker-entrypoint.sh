#!/bin/sh
# Lumora container entrypoint.
#   1. Applies database migrations (idempotent) if a schema is present.
#   2. Starts the Next.js standalone server.
set -e

if [ -n "$DATABASE_URL" ] && [ -f ./prisma/schema.prisma ]; then
  echo "[lumora] applying database migrations..."
  node ./node_modules/prisma/build/index.js migrate deploy
fi

echo "[lumora] starting server on ${HOSTNAME:-0.0.0.0}:${PORT:-3000}"
exec node server.js
