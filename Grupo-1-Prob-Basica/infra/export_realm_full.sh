#!/usr/bin/env bash
# Exporta toda la configuración de un realm de Keycloak en un solo JSON.
# Uso: ./export_realm_full.sh http://localhost:8080 admin admin Probabilidad ./keycloak/export/realm-Probabilidad-full.json

KC_URL="${1:-http://localhost:8080}"
KC_USER="${2:-admin}"
KC_PASS="${3:-admin}"
REALM="${4:-Probabilidad}"
OUT="${5:-./keycloak/export/realm-Probabilidad-full.json}"

set -euo pipefail

mkdir -p "$(dirname "$OUT")"
TMP="$(mktemp -d)"
trap "rm -rf $TMP" EXIT

echo "[1/8] Obteniendo token..."
TOKEN="$(curl -s -X POST "$KC_URL/realms/master/protocol/openid-connect/token" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" \
  -d "username=$KC_USER" \
  -d "password=$KC_PASS" \
  | jq -r .access_token)"

auth() {
  curl -s -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' "$@"
}

echo "[2/8] Base del realm..."
auth "$KC_URL/admin/realms/$REALM" > "$TMP/realm.json"

echo "[3/8] Clients..."
auth "$KC_URL/admin/realms/$REALM/clients?briefRepresentation=false" > "$TMP/clients.json"

echo "[4/8] Client scopes..."
auth "$KC_URL/admin/realms/$REALM/client-scopes" > "$TMP/client-scopes.json"

echo "[5/8] Grupos..."
auth "$KC_URL/admin/realms/$REALM/groups?briefRepresentation=false" > "$TMP/groups.json"

echo "[6/8] Roles de realm..."
auth "$KC_URL/admin/realms/$REALM/roles?briefRepresentation=false" > "$TMP/roles-realm.json"

echo "[7/8] Roles de cada cliente..."
mkdir -p "$TMP/client-roles"
for CID in $(jq -r '.[].id' "$TMP/clients.json"); do
  CNAME=$(jq -r ".[] | select(.id==\"$CID\") | .clientId" "$TMP/clients.json")
  auth "$KC_URL/admin/realms/$REALM/clients/$CID/roles?briefRepresentation=false" \
    > "$TMP/client-roles/${CNAME}.json"
done

echo "[8/8] Usuarios..."
auth "$KC_URL/admin/realms/$REALM/users?max=-1" > "$TMP/users.json" || echo "[]" > "$TMP/users.json"

echo "[*] Ensamblando JSON final..."
jq -n \
  --slurpfile realm "$TMP/realm.json" \
  --slurpfile clients "$TMP/clients.json" \
  --slurpfile scopes "$TMP/client-scopes.json" \
  --slurpfile groups "$TMP/groups.json" \
  --slurpfile rolesRealm "$TMP/roles-realm.json" \
  --slurpfile users "$TMP/users.json" '
  $realm[0] + {
    clients: $clients[0],
    clientScopes: $scopes[0],
    groups: $groups[0],
    roles: { realm: $rolesRealm[0] },
    users: $users[0]
  }' > "$OUT"

echo "✅ Export completo en: $OUT"
