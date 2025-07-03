#!/usr/bin/env python3
import atexit
import os
import signal
import subprocess
import sys
import time

port = os.environ.get("OPSICONFD_PORT", 44472)
print("OPSICONFD_PORT", port)

WAIT_TIME_CLEANUP = 10
TIMEOUT = 3
WORKDIR = "/workspace/docker/backend/opsiconfd"
OPSICONFD_CMD = f"{WORKDIR}/.venv/bin/python"
OPSICONFD_ARGS_SETUP = ["-m", "opsiconfd", "setup"]
OPSICONFD_ARGS = [
    "-m",
    "opsiconfd",
    "--workers=1",
    "--log-mode=redis",
    "--log-level-stderr=5",
    "--log-level-file=7",
    "--addon-dirs=/workspace/backend/addon",
    "--static-dir=/workspace/docker/backend/opsiconfd/opsiconfd_data/static",
]


def is_root():
    return os.geteuid() == 0


def cleanup():
    # wait 5 seconds
    print(f"Cleanup in {WAIT_TIME_CLEANUP} seconds...")
    time.sleep(WAIT_TIME_CLEANUP)
    try:
        print("Sending SIGTERM to all opsiconfd processes...")
        p1 = subprocess.run(
            ["pgrep", "-f", "opsiconfd"], capture_output=True, text=True, check=False
        )
        pids = [
            pid
            for pid in p1.stdout.strip().split("\n")
            if pid and pid != str(os.getpid())
        ]
        if pids:
            subprocess.run(["kill"] + pids, check=False)
            print("Cleanup completed (1).")
        else:
            print("Cleanup completed (2).")

        print(f"Waiting for opsiconfd processes to terminate... ({TIMEOUT} seconds)")
        for i in range(TIMEOUT):
            time.sleep(1)
            check = subprocess.run(["pgrep", "-f", "opsiconfd"], capture_output=True)
            if not check.stdout.strip():
                print("Cleanup completed (3)")
                break
        else:
            print("timeout reached, processes may still be running.", file=sys.stderr)
    except Exception as e:
        print(f"error cleaning up: {e}", file=sys.stderr)


def main():
    if not is_root():
        print("Need to run as root. Eg. `sudo bash run_opsiconfd.sh`", file=sys.stderr)
        sys.exit(1)

    atexit.register(cleanup)
    # call cleanup on error or exit
    signal.signal(signal.SIGTERM, lambda sig, frame: cleanup())  # Handle SIGTERM
    signal.signal(signal.SIGINT, lambda sig, frame: cleanup())  # Handle SIGINT

    print("> run opsiconfd")
    os.chdir(WORKDIR)

    try:
        # subprocess.run([OPSICONFD_CMD] + OPSICONFD_ARGS_SETUP, check=True)
        subprocess.run([OPSICONFD_CMD] + OPSICONFD_ARGS, check=True)
    except subprocess.CalledProcessError as e:
        print(f"error starting opsiconfd: {e}", file=sys.stderr)
        sys.exit(e.returncode)


if __name__ == "__main__":
    main()
