#!/usr/bin/env bash

# This Bash script attempts to find the Python binary and then executes a Python script called "bootstrap.py"
# with any additional arguments passed to the Bash script. The script first tries to locate the Python 3 binary and, if not found,
# falls back to the Python (hopefully pointing to Python 3) binary. Once the appropriate Python binary is determined, it is used to run the "bootstrap.py" script
# with any additional arguments provided to the Bash script.

# Find Python binary
PYTHON=`which python3`
if [ -z "$PYTHON" ]; then
    PYTHON=`which python`
fi

$PYTHON ./scripts/b/bootstrap.py "$@"