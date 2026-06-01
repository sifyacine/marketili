#!/usr/bin/env bash
# Marketili — Infrastructure setup verification checklist
# Run this script on your production server to verify TASK-17, TASK-19, TASK-20.
# It checks whether each external-service requirement is satisfied and reports status.

set -euo pipefail

DOMAIN="${1:-yourdomain.com}"
SERVER_PORT=5000
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
NC="\033[0m"

pass()  { echo -e "${GREEN}[PASS]${NC} $1"; }
fail()  { echo -e "${RED}[FAIL]${NC} $1"; }
info()  { echo -e "${YELLOW}[INFO]${NC} $1"; }

echo ""
echo "=== Marketili Infrastructure Security Checklist ==="
echo "Domain: $DOMAIN"
echo ""

# ── TASK-17: Cloudflare ───────────────────────────────────────────────────────
echo "--- TASK-17: Cloudflare in front of server ---"
RESOLVED_IP=$(dig +short "$DOMAIN" A | head -1)
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "unknown")

if [[ -z "$RESOLVED_IP" ]]; then
  fail "Could not resolve $DOMAIN — DNS not configured yet"
elif [[ "$RESOLVED_IP" == "$SERVER_IP" ]]; then
  fail "DNS for $DOMAIN points directly to this server IP ($SERVER_IP). Server IP is exposed. Add Cloudflare and enable orange-cloud proxy."
else
  info "DNS resolves to $RESOLVED_IP (not this server: $SERVER_IP)"
  # Check if it looks like a Cloudflare IP (they own 103.21.x, 103.22.x, 104.x, 172.67.x, 162.158.x, etc.)
  if echo "$RESOLVED_IP" | grep -qE '^(104\.|172\.(67|68|69|70|71)\.|162\.158\.|103\.(21|22|31)\.)'; then
    pass "IP $RESOLVED_IP appears to be a Cloudflare proxy IP — server is protected"
  else
    info "IP does not match known Cloudflare ranges. Verify manually at: https://www.cloudflare.com/ips/"
  fi
fi
echo ""

# ── TASK-19: MongoDB Atlas IP restriction ────────────────────────────────────
echo "--- TASK-19: MongoDB Atlas network restriction ---"
info "Cannot be verified automatically — requires Atlas dashboard."
echo "  Manual check:"
echo "  1. Log into MongoDB Atlas"
echo "  2. Go to Network Access"
echo "  3. Confirm 0.0.0.0/0 is NOT in the list"
echo "  4. Confirm only your server IP ($SERVER_IP) is allowed"
echo ""
# We can at least verify MongoDB is NOT listening on a public port
if command -v ss &>/dev/null; then
  MONGO_PUBLIC=$(ss -tlnp | grep 27017 | grep -v '127.0.0.1' | grep -v '::1' || true)
  if [[ -z "$MONGO_PUBLIC" ]]; then
    pass "Port 27017 is not publicly accessible from this server (Atlas is remote — expected)"
  else
    fail "Port 27017 appears to have a public listener: $MONGO_PUBLIC"
  fi
fi
echo ""

# ── TASK-20: Uptime monitoring ────────────────────────────────────────────────
echo "--- TASK-20: Uptime monitoring ---"
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$SERVER_PORT/api/health" 2>/dev/null || echo "000")
if [[ "$HEALTH_STATUS" == "200" ]]; then
  pass "Health endpoint /api/health responds 200 on localhost — ready to be monitored"
  info "Set up external monitoring at one of:"
  info "  - https://uptimerobot.com  (free, 5-min checks)"
  info "  - https://betterstack.com  (free tier, 3-min checks)"
  info "  - https://freshping.io     (free, 1-min checks)"
  info "Monitor URL: https://$DOMAIN/api/health"
else
  fail "Health endpoint returned $HEALTH_STATUS — server may not be running"
fi
echo ""

# ── TASK-18: Nginx ────────────────────────────────────────────────────────────
echo "--- TASK-18: Nginx reverse proxy ---"
if command -v nginx &>/dev/null; then
  NGINX_STATUS=$(systemctl is-active nginx 2>/dev/null || echo "unknown")
  if [[ "$NGINX_STATUS" == "active" ]]; then
    pass "Nginx is running"
    # Check Node is not publicly bound
    NODE_PUBLIC=$(ss -tlnp 2>/dev/null | grep ":$SERVER_PORT " | grep -v '127.0.0.1' | grep -v '::1' || true)
    if [[ -z "$NODE_PUBLIC" ]]; then
      pass "Node.js is bound to 127.0.0.1 only — not publicly exposed"
    else
      fail "Node.js is listening publicly on port $SERVER_PORT. Bind it to 127.0.0.1 only."
    fi
  else
    fail "Nginx is not running (status: $NGINX_STATUS). Deploy nginx/marketili.conf from the repo."
  fi
else
  fail "Nginx is not installed. Install: sudo apt install nginx"
fi
echo ""

echo "=== Checklist complete ==="
echo "See DDOS_PROTECTION_TASKS.md for full task descriptions and manual steps."
