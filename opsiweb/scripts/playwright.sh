
#!/bin/bash
# $1: filename                      e.g. BAuthFooter.stories.js
# $2: filename-full-extension       e.g. .stories.js
# $3: test-full-extension           e.g. .test.integration.js
# $4: playwright-config-path(rel)   e.g. .config/playwright-all-components.js
file=$1
file_ext=$2
file_ext_new=$3
npm_command=$4

# import bash-aliases to be able to use npm-uib
shopt -s expand_aliases
source $HOME/.bashrc
echo ""
echo ""
echo "---------------------------------------"
echo "ATTENTION: webgui-storybook have to be started!"
echo "---------------------------------------"
echo ""
echo ""
cd /workspace/opsiweb/
# build filename of testfile
echo "filename: ${file} - change extension from '${file_ext}' to '${file_ext_new}'"
testfile=$(sed 's/'"$file_ext"'/'"$file_ext_new"'/g' <<<"$file")
echo "---> testing file: $testfile"

# run playwright test on the testfile
echo "\nrun: npm-uib run $npm_command $testfile"
npm-uib run $npm_command $testfile

cd -