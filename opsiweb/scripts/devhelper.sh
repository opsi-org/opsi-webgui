
#!/bin/bash

# $1: filename                      e.g. BAuthFooter.stories.js
# $2: filename-full-extension       e.g. .stories.js
# $3: test-full-extension           e.g. .test.component.js
# $4: playwright-config-path(rel)   e.g. .config/playwright-all-components.js
# $5: sub commands logfile          e.g. .tmp_RESULT
file=$1
# file_ext=$2
file_ext_new=$2
npm_command=$3
file_prepattern_new=$4

set -e
# source $HOME/.bashrc
seedfile() {
   mkdir -p "$(dirname "$1")"
   touch "$1"
}

if [[ ${file} == "null" ]]; then
    echo "> Invalid testfile '${file}'"
    exit -2
fi

# echo "---> change filename '${file}' to '${file_prepattern_new}<filenameBase>${file_ext_new}'"

if [[ ${file} == "all" ]]; then
    echo ""
    echo "run: npm run $npm_command "
    npm run $npm_command
    if [[ ${npm_command} == "test:all:components" ]]; then
        echo "run clean tests"
        npm run test:all:delete-empty-results
    fi;
    exit 0
fi
if [[ ${file} == "all-changed" ]]; then
    cd /workspace/opsiweb/uib-components
    BRANCH="$(git rev-parse --abbrev-ref HEAD)"
    echo "> branch: $BRANCH"
    changedFiles=""
    if [[ "$BRANCH" == "main" ]]; then
        changedFiles=$(git diff --stat main origin/main --name-only | grep -i -P 'opsiweb/uib-components' || exit_code=$?)
    else
        changedFiles=$(git diff origin/main -r --no-commit-id --name-only || exit_code=$?)
    fi
    echo "> exit_code $exit_code"
    echo "> changed files 1: $changedFiles"

    # get only relevant files for playwright testing
    changedFiles=$(echo $changedFiles | grep -i -P 'stories.js|test.component.js|test.component.js-snapshots/*|test.unit.js|.vue' || exit_code=$?)
    # test also files where only snapshots where updated (remove ending -snapshots/...)
    changedFiles=$(echo $changedFiles | tr ' ' '\n' | awk -F "-snapshots/" '{print $1}' || exit_code=$?)

    if [[ "$changedFiles" == "" ]]; then
        echo "> no changed vue/test files found"
        exit 0;
    fi
    # get filenames of testfiles
    basenames=$(basename -s .stories.js $(basename -s .test.component.js $(basename -s .vue -a $changedFiles)))
    # Iterate the string variable using for loop
    basenamesWithSlash=""
    for val in $basenames; do
        basenamesWithSlash+="${file_prepattern_new}$val.test.component.js "
    done
    # echo "$basenamesWithSlash"
    testfilesUnique=$(echo $basenamesWithSlash | tr ' ' '\n'| awk '!a[$0]++' | tr '\n' ' '  | tr '/' ' ' )
    cd ..
    # echo "uniquetestfiles:$testfilesUnique"
    PI=""
    if [[ "$5" != 0 ]]; then
        seedfile $5
        PI=" > $5"
    fi

    COM="npm run $npm_command ${testfilesUnique} $PI"
    echo "> run: $COM"
    eval $COM
    # npm run test:all:delete-empty-results
    exit 0
fi

cd /workspace/opsiweb/
# build filename of testfile
# testfile=$(sed 's/'"$file_ext"'/'"$file_ext_new"'/g' <<<"$file")
dots=$(echo "${file}" | grep -o "\." | wc -l)
if [[ ${file} == *".png" ]]; then
    testfile="${file%-*}${file_ext_new}"
    method="${file%-*}"
    echo "method  $method"
elif [ ${dots} = '3' ]; then
    testfile="${file%.*.*.*}${file_ext_new}"
elif [ ${dots} = '2' ]; then
    testfile="${file%.*.*}${file_ext_new}"
elif [ ${dots} = '1' ]; then
    testfile="${file%.*}${file_ext_new}"
else
    echo "Cannot create testfile-filename"
    exit -1
fi

if [[ ${testfile} == ${file_ext_new} ]]; then
    echo "Invalid testfile '${file}'"
    exit -2
fi

# echo "---> testing file: $file_prepattern_new$testfile"
# run playwright test on the testfile
# echo ""
echo ""
echo "run: npm run $npm_command $file_prepattern_new$testfile"
npm run $npm_command "$file_prepattern_new$testfile"

if [[ ${npm_command} == "test:all:components*" ]]; then
    npm run test:all:delete-empty-results
fi;
cd -