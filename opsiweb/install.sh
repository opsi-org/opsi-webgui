
#!/bin/bash
echo "[script.sh] install dependencies..."
npm i -g dry-dry
dry i --dry-save-package-json-to package-merged.json --dry-keep-package-json
dry i -D @playwright/test
npx playwright install
