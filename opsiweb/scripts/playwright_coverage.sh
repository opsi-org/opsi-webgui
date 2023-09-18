# FIRST PARAM $1 HAS TO BE FILENAME OF SCREENSHOT RESULT
# cd ..

# echo "-----------------------TESTED"
grep -w '\[.*✓.*\] \› uib-components\/components\/*' $1  > .tmp_RESULTFILE_SUCCESS
grep -w '\[.*✘.*\] \› uib-components\/components\/*' $1  > .tmp_RESULTFILE_FAILED
RES_NAMES_SUCC=$(cat .tmp_RESULTFILE_SUCCESS | cut -d ' ' -f 8 | cut -d ':' -f 1 | tr " " "\n" )
RES_NAMES_FAIL=$(cat .tmp_RESULTFILE_FAILED | cut -d ' ' -f 8 | cut -d ':' -f 1 | tr " " "\n" )
# echo "-----SUCCESS"
# echo $RES_NAMES_SUCC | tr " " "\n"
# echo "-----FAIL"
# echo $RES_NAMES_FAIL | tr " " "\n"



# echo "-----------------------ALL"
RES_NAMES_ALL="$RES_NAMES_SUCC $RES_NAMES_FAIL"
# echo $RES_NAMES_ALL | tr " " "\n"

# echo "-----------------------UNIQUES"
RES_NAMES_UNIQUE=$(echo $RES_NAMES_ALL | tr " " "\n" | awk '!a[$0]++' | sort) #  > RESULTFILE_TESTED # uniques filenames
# echo $RES_NAMES_UNIQUE | tr " " "\n"
NUM_TESTS=$(echo $RES_NAMES_ALL | tr " " "\n" | wc -l) # count tested files
NUM_TESTED_FILES=$(echo $RES_NAMES_UNIQUE | tr " " "\n" | wc -l) # count tested files


NUM_TESTS_SUCCESS=$(echo $RES_NAMES_SUCC | tr " " "\n" | wc -l)
NUM_TESTS_FAILED=$(echo $RES_NAMES_FAIL | tr " " "\n" | wc -l)
echo "-----------------------Statistics"
echo "number tests: $NUM_TESTS"
echo "number tests success: $NUM_TESTS_SUCCESS"
echo "number tests failed: $NUM_TESTS_FAILED"
echo "number tested files: $NUM_TESTED_FILES"


# cat RESULTFILE_TESTED
RES_IDS=$(echo $RES_NAMES_UNIQUE | tr " " "\n"| cut -d '.' -f 1) # > RESULTFILE_TESTED
echo $RES_IDS | tr " " "\n" > .tmp_X_RESULT_FILEIDS_TESTED
# cat .tmp_X_RESULT_FILEIDS_TESTED

# echo "----------------------- ALL COMPONENTS which should have a test (all .vue files in components/): "
ls -1 uib-components/components/*/*.vue | sort > .tmp_RESULT_FILESFOUND
# cat .tmp_RESULT_FILESFOUND
# echo $RES_ALL | tr " " "\n"
NUM_FILES=$(cat .tmp_RESULT_FILESFOUND | wc -l)
echo "number components: $NUM_FILES"
# echo "----------------------- ALL-we: "
cat .tmp_RESULT_FILESFOUND | cut -d '.' -f 1 > .tmp_X_RESULT_FILEIDS_FOUND
# cat .tmp_X_RESULT_FILEIDS_FOUND



COLOR_RED="\033[31m"
COLOR_NORMAL="\033[0;39m"
echo "----------------------- FILES WITHOUT A SCREENSHOT TEST"
printf $COLOR_RED
comm -23 .tmp_X_RESULT_FILEIDS_FOUND .tmp_X_RESULT_FILEIDS_TESTED
printf $COLOR_NORMAL
echo "-----------------------"
# PERCENTAGE=$(($NUM_TESTED_FILES / $NUM_FILES))
PERCENTAGE_COVERAGE=$(expr $NUM_TESTED_FILES \* 100 / $NUM_FILES)
PERCENTAGE_SUCCESS=$(expr $NUM_TESTS_SUCCESS \* 100 / $NUM_TESTS)
PERCENTAGE_FAILED=$(expr $NUM_TESTS_FAILED \* 100 / $NUM_TESTS)
echo "RESULT COVERAGE: $PERCENTAGE_COVERAGE%;; SUCCESSFUL $PERCENTAGE_SUCCESS%; FAILED $PERCENTAGE_FAILED%"

# grep -w '\[.*[✘|✓].*\] \› uib-components\/components\/*' RESULTFILE
