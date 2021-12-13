
#!/bin/bash
alias n='dry --dry-save-package-json-to package-merged.json --dry-keep-package-json'
# RED='\033[0;31m'
ORANGE='\033[0;33m'
NC='\033[0m' # No Color
printf "${ORANGE}[install.sh] install dry...${NC}\n"
npm i -g dry-dry
printf "${ORANGE}[install.sh] merge package-json files...${NC}\n"
dry i --dry-save-package-json-to package-merged.json --dry-keep-package-json
printf "${ORANGE}[install.sh] install playwright...${NC}\n"
dry i -D @playwright/test
npx playwright install
