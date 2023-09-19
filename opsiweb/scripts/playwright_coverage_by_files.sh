
# echo "----------------------- ALL COMPONENTS which should have a test (all .vue files in components/): "
ls -1 uib-components/components/*/*.vue | sort > .tmp_RESULT_FILESFOUND_VUE
# cat .tmp_RESULT_FILESFOUND
# echo $RES_ALL | tr " " "\n"
NUM_FILES_VUE=$(cat .tmp_RESULT_FILESFOUND_VUE | wc -l)
echo "number components: $NUM_FILES_VUE"
# echo "----------------------- ALL-we: "
cat .tmp_RESULT_FILESFOUND_VUE | cut -d '.' -f 1 > .tmp_X_RESULT_FILEIDS_FOUND_VUE
# cat .tmp_X_RESULT_FILEIDS_FOUND
rm .tmp_RESULT_FILESFOUND_VUE

# echo "----------------------- ALL COMPONENTS which should have a test (all .vue files in components/): "
ls -1 uib-components/components/*/*.test.component.js | sort > .tmp_RESULT_FILESFOUND_PW
# cat .tmp_RESULT_FILESFOUND
# echo $RES_ALL | tr " " "\n"
NUM_FILES_PW=$(cat .tmp_RESULT_FILESFOUND_PW | wc -l)
echo "number components: $NUM_FILES_PW"
# echo "----------------------- ALL-we: "
cat .tmp_RESULT_FILESFOUND_PW | cut -d '.' -f 1 > .tmp_X_RESULT_FILEIDS_PW
# cat .tmp_X_RESULT_FILEIDS_FOUND
rm .tmp_RESULT_FILESFOUND_PW


COLOR_RED="\033[31m"
COLOR_NORMAL="\033[0;39m"
echo "----------------------- FILES WITHOUT A SCREENSHOT TEST"
printf $COLOR_RED
comm -23 .tmp_X_RESULT_FILEIDS_FOUND_VUE .tmp_X_RESULT_FILEIDS_PW
printf $COLOR_NORMAL
echo "==== COVERAGE REPORT SCREENSHOTS ==========="
PERCENTAGE_COVERAGE=$(expr $NUM_FILES_PW \* 100 / $NUM_FILES_VUE)
printf "FILES WITH A TESTFILE\t\t: $PERCENTAGE_COVERAGE%% ($NUM_FILES_PW/$NUM_FILES_VUE)\n"
echo "============================================"

# grep -w '\[.*[✘|✓].*\] \› uib-components\/components\/*' RESULTFILE
