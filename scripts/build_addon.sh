#!/bin/bash -e
# Build opsiconfd addon zip for opsi-webgui (Nuxt 4)
# Modeled after frontend/scripts/build_production_local.sh from v4.3-legacy-nuxt3
#
# Usage: bash scripts/build_addon.sh [ADDON_ID] [ADDON_NAME] [WORKING_DIR]
#   ADDON_ID    - addon identifier, e.g. "webgui" or "webgui-dev" (default: webgui)
#   ADDON_NAME  - human-readable name, e.g. "OpsiWebGUI" (default: OpsiWebGUI)
#   WORKING_DIR - absolute path to the repo root (default: current directory)

ADDON_ID="${1:-webgui}"
ADDON_NAME="${2:-OpsiWebGUI}"
WORKING_DIR="${3:-$(pwd)}"

FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
WEBGUI_DIR="webgui"

BACKEND_ADDON_DIR="${WORKING_DIR}/${BACKEND_DIR}/${WEBGUI_DIR}"
PY_CONST_FILE="${BACKEND_ADDON_DIR}/python/const.py"
TS_CONFIG_FILE="${WORKING_DIR}/${FRONTEND_DIR}/nuxt.config.ts"

ADDON_ID_ORIGIN="webgui"
ADDON_NAME_ORIGIN="OpsiWebGUI"

cleanup() {
    echo '> Restoring modified files...'
    git -C "${WORKING_DIR}" restore "${BACKEND_DIR}/${WEBGUI_DIR}/python/const.py" 2>/dev/null || true
    git -C "${WORKING_DIR}" restore "${FRONTEND_DIR}/nuxt.config.ts" 2>/dev/null || true
}

trap cleanup EXIT
trap cleanup ERR

echo "> WORKING_DIR: ${WORKING_DIR}"
echo "> ADDON_ID: ${ADDON_ID}, ADDON_NAME: ${ADDON_NAME}"

# Patch const.py and nuxt.config.ts if building a non-default addon (e.g. webgui-dev)
if [ "${ADDON_ID}" != "${ADDON_ID_ORIGIN}" ]; then
    echo "> Patching const.py: ADDON_ID=${ADDON_ID}, ADDON_NAME=${ADDON_NAME}"
    sed -i "s/ADDON_ID = \"${ADDON_ID_ORIGIN}\"/ADDON_ID = \"${ADDON_ID}\"/" "${PY_CONST_FILE}"
    sed -i "s/ADDON_NAME = \"${ADDON_NAME_ORIGIN}\"/ADDON_NAME = \"${ADDON_NAME}\"/" "${PY_CONST_FILE}"

    echo "> Patching nuxt.config.ts: ADDON_PATH=/addons/${ADDON_ID}"
    sed -i "s|const ADDON_PATH: string = '/addons/${ADDON_ID_ORIGIN}'|const ADDON_PATH: string = '/addons/${ADDON_ID}'|" "${TS_CONFIG_FILE}"
fi

# Build frontend
cd "${WORKING_DIR}/${FRONTEND_DIR}"
echo "> Installing pnpm dependencies..."
pnpm install --frozen-lockfile

echo "> Running pnpm generate..."
pnpm run generate

if [ ! -f ".output/public/index.html" ]; then
    echo "ERROR: Nuxt generate failed — no output at .output/public/index.html"
    exit 1
fi
echo "> Generated $(find .output/public -type f | wc -l) files"

cd "${WORKING_DIR}"

# Copy frontend output into backend addon data dir
echo "> Copying frontend output to backend..."
rm -rf "${BACKEND_ADDON_DIR}/data/app"
mkdir -p "${BACKEND_ADDON_DIR}/data/app"
cp -r "${WORKING_DIR}/${FRONTEND_DIR}/.output/public/." "${BACKEND_ADDON_DIR}/data/app/"

# Copy changelog if available (from setup:changelog artifact)
[ -f "${WORKING_DIR}/output/changelog.md" ] && \
    cp "${WORKING_DIR}/output/changelog.md" "${BACKEND_ADDON_DIR}/data/changelog/" || true

# Package addon directory
echo "> Packaging addon as '${ADDON_ID}'..."
rm -rf "${WORKING_DIR}/${ADDON_ID}"
mkdir -p "${WORKING_DIR}/${ADDON_ID}"
cp -r "${BACKEND_ADDON_DIR}/data"   "${WORKING_DIR}/${ADDON_ID}/"
cp -r "${BACKEND_ADDON_DIR}/python" "${WORKING_DIR}/${ADDON_ID}/"

# Apply ADDON_ID/ADDON_NAME into the packaged python files
if [ "${ADDON_ID}" != "${ADDON_ID_ORIGIN}" ]; then
    sed -i "s/ADDON_ID = \"${ADDON_ID_ORIGIN}\"/ADDON_ID = \"${ADDON_ID}\"/" "${WORKING_DIR}/${ADDON_ID}/python/const.py"
    sed -i "s/ADDON_NAME = \"${ADDON_NAME_ORIGIN}\"/ADDON_NAME = \"${ADDON_NAME}\"/" "${WORKING_DIR}/${ADDON_ID}/python/const.py"
fi

# Create zip
ZIP_NAME="opsi-${ADDON_ID}.zip"
zip -r -q "${WORKING_DIR}/${ZIP_NAME}" "${ADDON_ID}" -x '*/__pycache__/*'

echo ""
echo "> Done."
echo "> Addon directory : ${WORKING_DIR}/${ADDON_ID}/"
ls -lah "${WORKING_DIR}/${ZIP_NAME}"
