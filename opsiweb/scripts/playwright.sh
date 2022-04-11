
#!/bin/bash
# $1: filename                      e.g. BAuthFooter.stories.js
# $2: filename-full-extension       e.g. .stories.js
# $3: test-full-extension           e.g. .test.integration.js
# $4: playwright-config-path(rel)   e.g. .config/playwright-all-components.js
file=$1
# file_ext=$2
file_ext_new=$2
npm_command=$3

# import bash-aliases to be able to use npm-uib
shopt -s expand_aliases
source $HOME/.bashrc


if [[ ${file} == "null" ]]; then
    echo "Invalid testfile '${file}'"
    exit -2
fi

echo ""
echo ""
echo "---------------------------------------"
echo "ATTENTION: webgui-storybook have to be started!"
echo "---------------------------------------"
cd /workspace/opsiweb/
# build filename of testfile
echo "filename: ${file} - change file-extension to '${file_ext_new}'"
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

echo "---> testing file: $testfile"
# run playwright test on the testfile
echo ""
echo ""
echo "run: npm-uib run $npm_command $testfile"
npm-uib run $npm_command $testfile

cd -