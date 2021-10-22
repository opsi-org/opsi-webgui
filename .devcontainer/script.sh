#!/bin/bash
# echo "[script.sh] install dependencies"
# npm install
# echo "setting permissions"
# echo "[script.sh] setting permissions"
# npm install npm@8.1.1
# npm install -g npm@8.1.1
# chown -f -R 1000:1000 /root/.npm
# chown -f -R 1000:1000 /root/.npm/*
# chown -f -R 1000:1000 /root/.cache/
# chown -f -R 1000:1000 /root/.cache/*

# su - node <<SHT
cd ../opsiweb
echo "[script.sh] install dependencies..."
npm install
npm i -D @playwright/test
# echo "[script.sh] configure playwright..."
npx playwright install
# npx playwright install-deps

    # "playwright": "^1.15.2",
    # "playwright-chromium": "1.15.2",
    # "playwright-firefox": "1.15.2",
    # "playwright-test": "^7.1.0",
    # "playwright-webkit": "1.15.2",