#!/bin/bash

cd /workspace/frontend/
echo "====================================================== Check test files"
# file=".tmp_prepush_result_changed_files.log"
# bash ./scripts/playwright_coverage_by_files.sh
# rm $file

npm run lint --silent
exit_code_1=$?

npm run lint:missing-i18n --silent
exit_code_2=$?

npm run tscs --silent
exit_code_3=$?

echo "======================================================"
cd -
echo ""
echo "exitcodes $exit_code_1 , $exit_code_2 , $exit_code_3"
exit_code=0
if [ "$exit_code_1" -ne 0 ] || [ "$exit_code_2" -ne 0 ] || [ "$exit_code_3" -ne 0 ];then
    exit 1
fi