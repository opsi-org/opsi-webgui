
#!/bin/bash
# $1: filename                      e.g. BAuthFooter.stories.js
# $2: filename-full-extension       e.g. .stories.js
# $3: test-full-extension           e.g. .test.integration.js
# $4: playwright-config-path(rel)   e.g. .config/playwright-all-components.js
file=$1
# file_ext=$2
file_ext_new=$2
npm_command=$3
file_prepattern_new=$4

# import bash-aliases to be able to use npm-uib
shopt -s expand_aliases
source $HOME/.bashrc


if [[ ${file} == "null" ]]; then
    echo "Invalid testfile '${file}'"
    exit -2
fi

# echo "---> change filename '${file}' to '${file_prepattern_new}<filenameBase>${file_ext_new}'"

if [[ ${file} == "all-changed" ]]; then
    echo "- try to get changed filenames "
    cd /workspace/opsiweb/uib-components
    changedFiles=$(git diff origin/develop -r --no-commit-id --name-only | grep -i -P 'stories.js|test.integration.js|test.unit.js|.vue' | grep -v 'test.integration.js-snapshot')
    # echo "$changedFiles"
    basenames=$(basename -s .stories.js $(basename -s .test.integration.js $(basename -s .vue -a $changedFiles)))
    # Iterate the string variable using for loop
    basenamesWithSlash=""
    for val in $basenames; do
        basenamesWithSlash+="${file_prepattern_new}$val.test.integration.js "
    done
    # echo "$basenamesWithSlash"
    testfilesUnique=$(echo $basenamesWithSlash | tr ' ' '\n' | awk '!a[$0]++' | tr '\n' ' \/' )
    cd ..
    echo "run: npm-uib run $npm_command '$testfilesUnique'"
    npm-uib run $npm_command "$testfilesUnique"
    npm run test:all:delete-empty-results
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
echo "run: npm-uib run $npm_command $file_prepattern_new$testfile"
npm run $npm_command "$file_prepattern_new$testfile"

if [[ ${npm_command} == "test:all:components*" ]]; then
    npm run test:all:delete-empty-results
fi;
cd -