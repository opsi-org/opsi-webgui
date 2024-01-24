cd /workspace/frontend/
file=".tmp_prepush_result_changed_files.log"
echo "====================================================== Check test files"
cd /workspace/frontend
bash ./scripts/playwright_coverage_by_files.sh $file
# rm $file

echo "======================================================"
echo ""
cd ..
echo "exitcode $exit_code"
exit $exit_code