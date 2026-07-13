# Root conftest for backend tests.
# Must be the FIRST conftest loaded so it can clean sys.argv before any opsiconfd
# module is imported. opsiconfd initialises its argparse config on import and would
# crash with SystemExit: 2 if it encounters unknown pytest arguments.
import sys

# Keep only the executable name; opsiconfd's configargparse can then initialise
# cleanly without seeing "--rootdir", "-v" etc.
sys.argv = sys.argv[:1]
