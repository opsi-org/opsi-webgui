
#!/bin/bash
# alias n='npm'
# RED='\033[0;31m'
cd /workspace/opsiweb/
ORANGE='\033[0;33m'
NC='\033[0m' # No Color
# printf "${ORANGE}[install.sh] install dry...${NC}\n"
# npm i -g dry-dry
printf "${ORANGE}[install.sh] merge package-json files...${NC}\n"
npm i
printf "${ORANGE}[install.sh] install playwright...${NC}\n"
npm i -D @playwright/test
npx playwright install
npx playwright install-deps

