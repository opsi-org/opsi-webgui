#!/bin/bash
# This script runs before the container is created.
# Use it for tasks like setting up prerequisite resources outside the container.
echo "Initializing environment..."
echo "ADDON_NAME is ${ADDON_NAME}"
pwd

base_dir=$(dirname $(dirname $(readlink -f $0)))
${base_dir}/scripts/devenv.sh --yes