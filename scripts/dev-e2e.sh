#!/usr/bin/env bash
# dev-e2e.sh
#
# Run the Playwright e2e suite *inside the dev container*, against the dev
# container's opsiconfd (https://localhost:4447/addons/webgui/app).
#
# Usage:
#   scripts/dev-e2e.sh                 # smoke matrix (DE/light/desktop/chromium)
#   scripts/dev-e2e.sh --build         # rebuild the SPA first (pick up frontend changes)
#   scripts/dev-e2e.sh --live          # run against the running `pnpm dev` server
#                                      # (:3000) - NO opsiconfd boot, NO SPA build.
#                                      # Fastest loop: start `pnpm dev` once, then
#                                      # iterate. Requires opsiconfd already up.
#   scripts/dev-e2e.sh -g "login"      # grep filter (forwarded to playwright)
#   scripts/dev-e2e.sh tests/e2e/specs/pages/login.spec.ts   # single spec
#   scripts/dev-e2e.sh -u -g "..."     # refresh baselines (CI accepts these,
#                                      # maxDiffPixelRatio 0.05 absorbs font-AA)
#   scripts/dev-e2e.sh --live -u       # refresh baselines against the running Nuxt dev server (no SPA build)

set -euo pipefail

DEV_SERVICE="opsi-webgui-dev"
DEV_COMPOSE="docker/docker-compose.yml"

if [ ! -f /test-entrypoint.sh ] || [ ! -d /workspace/frontend ]; then
  cd "$(dirname "$0")/.."
  if ! docker compose -f "$DEV_COMPOSE" ps --status running --services 2>/dev/null | grep -qx "$DEV_SERVICE"; then
    echo "ERROR: dev container '$DEV_SERVICE' is not running."
    echo "Start it first, e.g.:"
    echo "  docker compose -f $DEV_COMPOSE up -d $DEV_SERVICE"
    echo "  (or open the folder in the VS Code dev container)"
    exit 1
  fi
  echo ">> Re-running inside the dev container ($DEV_SERVICE) ..."
  # reuse that user's Playwright browser cache instead of root's empty one.
  exec docker compose -f "$DEV_COMPOSE" exec -T --user "$(id -u)" \
    -e E2E_PIPELINE_SOURCE="${E2E_PIPELINE_SOURCE:-}" \
    -e SCREENSHOT_DIR="${SCREENSHOT_DIR:-}" \
    -e TEST_USER="${TEST_USER:-}" \
    -e TEST_PASSWORD="${TEST_PASSWORD:-}" \
    -e TEST_SESSION_EXPIRY_SEC="${TEST_SESSION_EXPIRY_SEC:-}" \
    "$DEV_SERVICE" \
    bash /workspace/scripts/dev-e2e.sh "$@"
fi

DO_BUILD=0
LIVE=0
PW_ARGS=()
for arg in "$@"; do
  case "$arg" in
    --build) DO_BUILD=1 ;;
    --live) LIVE=1 ;;
    -u|--update-snapshots) PW_ARGS+=("--update-snapshots=all") ;;
    *) PW_ARGS+=("$arg") ;;
  esac
done

cd /workspace/frontend

ADDON_APP="/workspace/backend/webgui/data/app"
if [ "$LIVE" = "1" ]; then
  BASE_URL="https://localhost:3000/addons/webgui/app"
else
  BASE_URL="https://localhost:4447/addons/webgui/app"
fi

case " $* " in
  *" --update-snapshots "*|*" -u "*)
    echo ">> Updating baselines (CI accepts these via maxDiffPixelRatio 0.05)."
    ;;
esac

echo ">> Ensuring opsiconfd is running ..."
if [ "$LIVE" = "1" ]; then
  echo "   (--live) assuming opsiconfd + 'pnpm dev' are already running."
else
  BACKUP_MARKER=/workspace/docker/.backup-restored
  if [ ! -f "$BACKUP_MARKER" ]; then
    OPSI_BACKUP_URL="${OPSI_BACKUP_URL:-https://binaryindex.uib.gmbh/development/opsi-backups/opsi.acme.corp_4.3.json}"
    echo "   restoring backup (first run) ..."
    /workspace/scripts/restore-backup.sh "$OPSI_BACKUP_URL" && sudo touch "$BACKUP_MARKER" \
      || echo "   WARN: backup restore failed - tests may run against empty data"
  fi
  if ! sudo supervisorctl status opsiconfd 2>/dev/null | grep -q RUNNING; then
    sudo supervisorctl start opsiconfd || true
  fi

  echo ">> Waiting for opsiconfd health ..."
  for _ in $(seq 1 90); do
    code=$(curl -sk -o /dev/null -w '%{http_code}' https://localhost:4447/admin/healthy 2>/dev/null || echo 000)
    [ "$code" != "000" ] && { echo "   opsiconfd up (HTTP $code)."; break; }
    sleep 2
  done
fi

if ! ls "${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}"/chromium-* >/dev/null 2>&1; then
  echo ">> Installing Playwright chromium (first run only) ..."
  pnpm exec playwright install chromium
fi

if [ "$LIVE" = "1" ]; then
  echo ">> --live: serving from the running Nuxt dev server (skipping SPA build)."
elif [ "$DO_BUILD" = "1" ] || [ ! -f "$ADDON_APP/index.html" ]; then
  echo ">> Building webgui SPA into addon data/app ($ADDON_APP) ..."
  pnpm run generate
  mkdir -p "$ADDON_APP"
  cp -r .output/public/. "$ADDON_APP/"
else
  echo ">> Reusing existing SPA in $ADDON_APP (pass --build to rebuild)."
fi

echo ">> Running e2e suite against $BASE_URL ..."
BASE_URL="$BASE_URL" \
TEST_USER="${TEST_USER:-adminuser}" \
TEST_PASSWORD="${TEST_PASSWORD:-adminuser}" \
NODE_TLS_REJECT_UNAUTHORIZED=0 \
SCREENSHOT_DIR="${SCREENSHOT_DIR:-test-results/screenshots}" \
CI_PIPELINE_SOURCE="${E2E_PIPELINE_SOURCE:-}" \
  pnpm exec playwright test --config tests/playwright.config.ts \
    --output=test-results/dev-artifacts "${PW_ARGS[@]}"

echo ""
echo ">> Done. HTML report: frontend/test-results/html/index.html"
