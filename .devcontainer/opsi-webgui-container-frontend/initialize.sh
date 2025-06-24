#!/bin/bash
# This script runs before the container is created.
# Use it for tasks like setting up prerequisite resources outside the container.
echo "Initializing environment..."
pwd
rm -rf .vscode
ln -s frontend/.vscode .vscode

SCRIPTDIR=$(dirname $(readlink -f $0))
${SCRIPTDIR}/devenv.sh --yes