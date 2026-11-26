#!/bin/sh
# Creates the "keycloak" store with the authorization model (store.yaml, model.dsl).
# Runs on every `docker compose up`: an existing store is kept, so no duplicates.
set -eu

API_URL=${FGA_API_URL:-http://openfga:8080}
STORE_NAME=${FGA_STORE_NAME:-keycloak}

count=$(fga store list --api-url "$API_URL" --name "$STORE_NAME" | jq '.stores | length')
if [ "$count" -gt 0 ]; then
  echo "Store '$STORE_NAME' already exists, skipping the import"
  exit 0
fi

echo "Creating store '$STORE_NAME' with the authorization model"
fga store import --api-url "$API_URL" --file /openfga/store.yaml
