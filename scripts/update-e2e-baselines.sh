#!/usr/bin/env bash
# update-e2e-baselines.sh
set -euo pipefail

cd "$(dirname "$0")/.."

# Forward any user-supplied test filter (spec path or -g <grep>) to playwright.
PW_FILTER="$*"

COMPOSE_FILE="docker/docker-compose.test.yml"
PROJECT="webgui-baselines"
export LOCAL_WORKSPACE_DIR="${LOCAL_WORKSPACE_DIR:-$(pwd)}"

if [ ! -f docker/.env ]; then
  cat > docker/.env <<EOF
OPSI_HOSTNAME=opsi.test.local
OPSI_DOMAIN=test.local
OPSICONFD_PORT=4447
USER=$(id -un)
UID=$(id -u)
ADDON_NAME=webgui
ADDON_ID=webgui
LOCAL_WORKSPACE_DIR=$LOCAL_WORKSPACE_DIR
EOF
fi

echo ">> Building dev image (opsiconfd) ..."
docker compose -f docker/docker-compose.yml build opsi-webgui-dev

echo ">> Starting opsiconfd (restores acme.corp backup; may take a few minutes) ..."
docker compose -f "$COMPOSE_FILE" -p "$PROJECT" up -d opsiconfd

cleanup() {
  echo ">> Tearing down (containers + network; cached venv/node_modules volumes kept) ..."
  docker compose -f "$COMPOSE_FILE" -p "$PROJECT" down || true
  if [ "${BASELINES_CLEAN:-0}" = "1" ]; then
    echo ">> BASELINES_CLEAN=1 -> removing cached volumes for a from-scratch build ..."
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT" down -v || true
  fi
}
trap cleanup EXIT

echo ">> Waiting for opsiconfd to become healthy ..."
echo "   (first run on a fresh volume compiles the opsiconfd venv -> several minutes)"
for _ in $(seq 1 180); do
  status=$(docker inspect -f '{{.State.Health.Status}}' \
    "$(docker compose -f "$COMPOSE_FILE" -p "$PROJECT" ps -q opsiconfd)" 2>/dev/null || echo unknown)
  echo "   opsiconfd health: $status"
  [ "$status" = "healthy" ] && break
  sleep 5
done

echo ">> Generating baselines inside the Playwright image (--update-snapshots) ..."
docker compose -f "$COMPOSE_FILE" -p "$PROJECT" run --rm \
  -e CI_PIPELINE_SOURCE="${E2E_PIPELINE_SOURCE:-}" \
  -e PW_FILTER="$PW_FILTER" \
  -e HOST_UID="$(id -u)" \
  -e HOST_GID="$(id -g)" \
  --entrypoint sh e2e -c '
    set -e
    corepack enable pnpm
    pnpm install --frozen-lockfile
    pnpm exec playwright install chromium firefox
    echo "Building webgui SPA into addon data/app ..."
    pnpm run generate
    mkdir -p /addon-app
    cp -r "$NITRO_OUTPUT_DIR/public/." /addon-app/
    # shellcheck disable=SC2086
    pnpm exec playwright test --config tests/playwright.config.ts --update-snapshots $PW_FILTER
    # The playwright image runs as root; hand the regenerated baselines (and the
    # matrix screenshots) back to the host user so the dev container and git can
    # read/overwrite them without EACCES.
    chown -R "$HOST_UID:$HOST_GID" tests/e2e/__snapshots__ screenshots 2>/dev/null || true
  '

echo ""
echo ">> Done. Review and commit the baselines:"
echo "   git status --short frontend/tests/e2e/__snapshots__/"
echo "   git add frontend/tests/e2e/__snapshots__/ && git commit -m '[chg] test(e2e): regenerate VR baselines in CI image'"
