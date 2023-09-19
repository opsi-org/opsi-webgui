#!/bin/bash


# echo "----------------------- ALL COMPONENTS which should have a test (all .vue files in components/): "
ls -1 uib-components/components/*/*.vue | sort > .tmp_RESULT_FILESFOUND_VUE
# cat .tmp_RESULT_FILESFOUND
# echo $RES_ALL | tr " " "\n"
NUM_FILES_VUE=$(cat .tmp_RESULT_FILESFOUND_VUE | wc -l)
# echo "----------------------- ALL-we: "
cat .tmp_RESULT_FILESFOUND_VUE | cut -d '.' -f 1 > .tmp_X_RESULT_FILEIDS_FOUND_VUE
# cat .tmp_X_RESULT_FILEIDS_FOUND
rm -f .tmp_RESULT_FILESFOUND_VUE

# echo "----------------------- ALL COMPONENTS which should have a test (all .vue files in components/): "
ls -1 uib-components/components/*/*.test.component.js | sort > .tmp_RESULT_FILESFOUND_PW
# cat .tmp_RESULT_FILESFOUND
# echo $RES_ALL | tr " " "\n"
NUM_FILES_PW=$(cat .tmp_RESULT_FILESFOUND_PW | wc -l)
# echo "----------------------- ALL-we: "
cat .tmp_RESULT_FILESFOUND_PW | cut -d '.' -f 1 > .tmp_X_RESULT_FILEIDS_PW
# cat .tmp_X_RESULT_FILEIDS_FOUND
rm -f .tmp_RESULT_FILESFOUND_PW

COLOR_YELLOW='\e[1;33m'
COLOR_RED="\033[31m"
COLOR_BLUE='\e[0;34m'
COLOR_NORMAL="\033[0;39m"
# printf $COLOR_BLUE
echo "--------------------------------- FILES WITHOUT A SCREENSHOT TEST"
printf $COLOR_YELLOW
comm -23 .tmp_X_RESULT_FILEIDS_FOUND_VUE .tmp_X_RESULT_FILEIDS_PW
printf $COLOR_BLUE
PERCENTAGE_COVERAGE=$(expr $NUM_FILES_PW \* 100 / $NUM_FILES_VUE)
printf "FILES WITH A TESTFILE\t: $PERCENTAGE_COVERAGE%% ($NUM_FILES_PW/$NUM_FILES_VUE) (in general)\n"
printf $COLOR_NORMAL

if [ "$1" ]; then
    # printf $COLOR_BLUE
    echo "--------------------------------- FAILED TESTS"
    # grep -w '\[.*✓.*\] \› uib-components\/components\/*' $1  > .tmp_RESULTFILE_SUCCESS
    grep -w '\[.*✘.*\] \› uib-components\/components\/*' $1  > .tmp_RESULTFILE_FAILED
    # RES_NAMES_SUCC=$(cat .tmp_RESULTFILE_SUCCESS | cut -d ' ' -f 8 | cut -d ' ' -f 5 | tr " " "\n" )
    # RES_NAMES_FAIL=$(cat .tmp_RESULTFILE_FAILED | cut -d ' ' -f 8 | cut -d ':' -f 1 | tr " " "\n" )
    RES_NAMES_FAIL=$(cat .tmp_RESULTFILE_FAILED | cut -d ' ' -f 8 | tr " " "\n" )
    rm -f .tmp_RESULTFILE_FAILED #.tmp_RESULTFILE_SUCCESS
    printf $COLOR_RED
    echo $RES_NAMES_FAIL | tr " " "\n"
    printf $COLOR_NORMAL
    printf "for details run: "
    printf $COLOR_BLUE
    printf "cat $(pwd)/$1\n"
    printf $COLOR_NORMAL
fi

# grep -w '\[.*[✘|✓].*\] \› uib-components\/components\/*' RESULTFILE
