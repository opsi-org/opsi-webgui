#!/bin/bash
# This script runs before the container is created.
echo "Initializing environment..."

base_dir=$(dirname $(dirname $(readlink -f $0)))
${base_dir}/scripts/devenv.sh --yes
