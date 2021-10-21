#!/bin/bash
echo "install dependencies"
# npm install
# echo "setting permissions"
chown -f -R 1000:1000 /root/.npm
chown -f -R 1000:1000 /root/.npm/*
chown -f -R 1000:1000 /root/.cache/
chown -f -R 1000:1000 /root/.cache/*


# su - node <<SHT
cd /workspace/opsiweb
# echo "[script.sh] update npm..."
# npm install -g npm

echo "[script.sh] install dependencies..."
npm install
# npm audit fix
echo "[script.sh] configure playwright..."
npx playwright install
npx playwright install-deps