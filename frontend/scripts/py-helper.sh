#!/bin/bash

set -e

if command -v python3 &>/dev/null; then
    PYTHON=python3
else
    PYTHON=python
fi

MYVAR=$($PYTHON $@ || exit_code=$?)

echo "$MYVAR"

exit $exit_code
