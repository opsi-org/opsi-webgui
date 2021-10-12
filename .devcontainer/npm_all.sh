#!/bin/bash
# cd ../opsiweb
echo "###############################################"
echo "################ TEST ALL #####################"
echo "###############################################"
echo ".................check lint...................."
npm run lint:js
echo ".................check test:unit..............."
npx jest --reporters jest-silent-reporter --ci --silent
echo ".................check test:integration........"
npx playwright test test/integration --quiet
echo ".................check test:e2e................"
npx playwright test test/e2e --quiet
echo "###############################################"
echo "################ TEST ALL END #################"
echo "###############################################"
