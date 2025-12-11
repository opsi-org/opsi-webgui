#!/bin/bash
# This script runs before the container is created.
# Use it for tasks like setting up prerequisite resources outside the container.
echo "Initializing environment..."
pwd
rm -rf .vscode
ln -s backend/.vscode .vscode

base_dir=$(dirname $(dirname $(readlink -f $0)))
${base_dir}/backend/scripts/devenv.sh --yes