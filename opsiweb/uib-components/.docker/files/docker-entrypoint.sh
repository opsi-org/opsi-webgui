#!/usr/bin/env sh

set -o errexit
set -o nounset

cmd="sleep infinity"
# 2>&1 &"

exec $cmd
