cd /workspace/frontend/
echo "====================================================== Check test files"
# file=".tmp_prepush_result_changed_files.log"
cd /workspace/frontend
bash ./scripts/playwright_coverage_by_files.sh
# rm $file

echo "======================================================"
echo ""
cd ..
echo "exitcode $exit_code"
exit $exit_code