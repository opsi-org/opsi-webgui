cd /workspace/frontend/
echo "====================================================== Check test files"
# file=".tmp_prepush_result_changed_files.log"
# bash ./scripts/playwright_coverage_by_files.sh
# rm $file

npm run lint || exit_code=$?

npm run lint:missing-i18n || exit_code=$?

npm run tsc || exit_code=$?

echo "======================================================"
cd -
echo ""
echo "exitcode $exit_code"
exit $exit_code