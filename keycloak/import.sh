#!/bin/bash
# Creates the workshop clients, users, role model and role assignments in the master realm.
# The openfga-events-publisher extension publishes each change to OpenFGA.
# Runs on every `docker compose up`: skipped when the workshop is already imported.
set -euo pipefail

kcadm() { /opt/keycloak/bin/kcadm.sh "$@"; }

kcadm config credentials --server "$KEYCLOAK_URL" --realm master --user "$KEYCLOAK_USER" --password "$KEYCLOAK_PASSWORD"

if [[ $(kcadm get clients -r master -q clientId=portal --fields id --format csv --noquotes) ]]; then
  echo "Workshop configuration already imported, skipping"
  exit 0
fi

# Workshop runs on plain HTTP: browser requests reach Keycloak through Docker's NAT, not from a
# private address, so the default (HTTPS required for external requests) rejects them with 403.
echo "Allowing HTTP on the master realm (workshop only)"
kcadm update realms/master -s sslRequired=NONE

echo "Enabling the openfga-events-publisher event listener"
kcadm update events/config -r master -s 'eventsListeners=["openfga-events-publisher","jboss-logging"]'

echo "Creating clients"
kcadm create clients -r master -s clientId=portal -s publicClient=true \
  -s 'redirectUris=["http://store:9090/callback"]' -s 'webOrigins=["http://store:9090"]' \
  -s 'attributes={"post.logout.redirect.uris": "http://store:9090/home?action=logout", "access.token.lifespan": 3600}'
# Testing only (make test): password grant. Not recommended outside tests (RFC 9700).
kcadm create clients -r master -s clientId=smoke-test -s publicClient=true \
  -s directAccessGrantsEnabled=true -s standardFlowEnabled=false

echo "Creating users (password: demo1234!)"
for user in "paula Paula Von" "peter Peter Anderson" "richard Richard Miles"; do
  read -r username first last <<< "$user"
  kcadm create users -r master -s username="$username" -s firstName="$first" -s lastName="$last" \
    -s email="$username@demo.com" -s emailVerified=true -s enabled=true
  kcadm set-password -r master --username "$username" --new-password 'demo1234!'
done

echo "Creating the role model"
kcadm create roles -r master -s name=admin-catalog -s 'description=Admin Catalog'
kcadm create roles -r master -s name=analyst-catalog -s 'description=Analyst Catalog'
kcadm create roles -r master -s name=view-product -s 'description=View product'
kcadm create roles -r master -s name=edit-product -s 'description=Edit product'
kcadm add-roles -r master --rname analyst-catalog --rolename view-product
kcadm add-roles -r master --rname admin-catalog --rolename view-product
kcadm add-roles -r master --rname admin-catalog --rolename edit-product

echo "Assigning roles"
kcadm add-roles -r master --uusername paula --rolename analyst-catalog
kcadm add-roles -r master --uusername richard --rolename admin-catalog

echo "Workshop configuration imported"
