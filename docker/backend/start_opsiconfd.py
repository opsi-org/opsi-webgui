#!/usr/bin/env python3
import os
import sys
import subprocess
import time
import signal
import atexit

WAIT_TIME_CLEANUP = 10
TIMEOUT = 3
#OPSICONFD_CMD = "/root/.local/bin/uv"
OPSICONFD_CMD = "/workspace/docker/backend/opsiconfd/.venv/bin/python"
OPSICONFD_ARGS = [
    "-m", "opsiconfd",
    "--workers=1",
    "--log-mode=redis",
    "--log-level-stderr=5",
    "--addon-dirs=/workspace/backend/addon",
    "--static-dir=/workspace/docker/backend/opsiconfd/opsiconfd_data/static"
]
WORKDIR = "/workspace/docker/backend/opsiconfd"

def is_root():
    return os.geteuid() == 0

def cleanup():
    # wait 5 seconds
    print(f"Cleanup in {WAIT_TIME_CLEANUP} seconds...")
    time.sleep(WAIT_TIME_CLEANUP)
    print("Cleanup opsiconfd processes")
    try:
        print("Sende SIGTERM an alle opsiconfd-Prozesse...")
        p1 = subprocess.run(
            ["pgrep", "-f", "opsiconfd"],
            capture_output=True,
            text=True,
            check=False
        )
        pids = [pid for pid in p1.stdout.strip().split("\n") if pid and pid != str(os.getpid())]
        if pids:
            subprocess.run(["kill"] + pids, check=False)
            print("Alle opsiconfd-Prozesse wurden beendet.")
        else:
            print("Keine weiteren opsiconfd-Prozesse gefunden.")

        print(f"Warten auf Beendigung... ({TIMEOUT} Sekunden)")
        for i in range(TIMEOUT):
            time.sleep(1)
            check = subprocess.run(["pgrep", "-f", "opsiconfd"], capture_output=True)
            if not check.stdout.strip():
                print("Alle Prozesse erfolgreich beendet.")
                break
        else:
            print("Timeout erreicht, Prozesse laufen möglicherweise noch.")
    except Exception as e:
        print(f"Fehler beim Cleanup: {e}", file=sys.stderr)

def main():
    if not is_root():
        print("Not running as root")
        sys.exit(1)

    atexit.register(cleanup)
    # call cleanup on error or exit
    #signal.signal(signal.SIGQUIT, lambda sig, frame: cleanup()) # Handle SIGQUIT
    signal.signal(signal.SIGTERM, lambda sig, frame: cleanup()) # Handle SIGTERM
    signal.signal(signal.SIGINT, lambda sig, frame: cleanup()) # Handle SIGINT

    print("run opsiconfd")
    os.chdir(WORKDIR)

    try:
        subprocess.run([OPSICONFD_CMD] + OPSICONFD_ARGS, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Fehler beim Start von opsiconfd: {e}", file=sys.stderr)
        sys.exit(e.returncode)

if __name__ == "__main__":
    main()