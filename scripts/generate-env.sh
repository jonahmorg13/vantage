#!/bin/bash
# Generates a .env file with secure random values for docker compose.
# Run from the repo root: ./scripts/generate-env.sh

set -e

ENV_FILE=".env"

if [ -f "$ENV_FILE" ]; then
  read -p ".env already exists. Overwrite? (y/N) " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }
fi

SA_PASSWORD=$(openssl rand -base64 24)
JWT_SIGNING_KEY=$(openssl rand -base64 64 | tr -d '\n')

cat > "$ENV_FILE" <<EOF
SA_PASSWORD=${SA_PASSWORD}
JWT_SIGNING_KEY=${JWT_SIGNING_KEY}
EOF

echo "Generated .env with secure random values."
