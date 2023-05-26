#!/bin/bash
# cd ../opsiweb
echo "###############################################"
echo "################ TEST ALL #####################"
echo "###############################################"
echo "\n\n\n"
echo ".................check lint...................."
npm run lint:all
echo ".................check test:unit..............."
npx jest --reporters jest-silent-reporter --ci --silent
echo ".................check test:component........"
npx playwright test test/component --quiet
echo ".................check test:usecase................"
npx playwright test test/usecase --quiet
echo ".................check test:accessibility................"
npx playwright test test/accessibility --quiet
echo "\n\n\n"
echo "###############################################"
echo "################ TEST ALL END #################"
echo "###############################################"
