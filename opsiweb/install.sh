
#!/bin/bash
echo "[install.sh] install dry..."
npm i -g dry-dry
echo "[install.sh] merge package-json files..."
dry i --dry-save-package-json-to package-merged.json --dry-keep-package-json
echo "[install.sh] install playwright..."
dry i -D @playwright/test
npx playwright install
