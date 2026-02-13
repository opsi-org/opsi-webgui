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
WORKDIR = "/workspace/docker/opsiconfd"
OPSICONFD_CMD = f"{WORKDIR}/.venv/bin/python"
url = os.environ.get("OPSICONFD_RESTORE_BACKUP_URL", None)
serverid = os.environ.get("OPSI_HOSTNAME", "opsi.acme.corp")
OPSICONFD_RESTORE = [
    "-m",
    "opsiconfd",
    "restore",
    "--config-files",
    "--redis-data",
    "--server-id",
    serverid,
]
OPSICONFD_RENAME_ARGS = [
    "-m",
    "opsiconfd",
    "setup",
    "--rename-server",
    serverid,
]
OPSICONFD_ARGS_SETUP = ["-m", "opsiconfd", "setup"]
OPSICONFD_ARGS = [
    "-m",
    "opsiconfd",
    "--workers=1",
    "--log-mode=redis",
    "--log-level-stderr=7",
    "--log-level-file=7",
    "--static-dir=/workspace/docker/opsiconfd/opsiconfd_data/static",
    # "--addon-dir=/workspace/backend/addon",
    "--cors-origin=*",
]


def is_root():
    return os.geteuid() == 0


def cleanup():
    # wait 5 seconds
    print(f"Cleanup in {WAIT_TIME_CLEANUP} seconds...")
    time.sleep(WAIT_TIME_CLEANUP)
    kill_opsiconfd_processes()
    print("Exiting cleanup.")


def kill_opsiconfd_processes():
    cmd = "pkill -f ' opsiconfd' && ps -af | grep 'opsiconfd'"
    try:
        print("Killing existing opsiconfd processes...")
        subprocess.run(cmd, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"no opsiconfd processes to kill: {e}", file=sys.stderr)


def restore_backup():
    if not url:
        print("No OPSICONFD_RESTORE_BACKUP_URL set, skipping restore.")
        return
    # dowload json file from url and restore
    print("Restoring backup from", url)
    filename = "/workspace/opsi.acme.corp_4.3.json"
    requests_cmd = ["curl", "-o", filename, url]
    subprocess.run(requests_cmd, check=True)
    res = subprocess.run([OPSICONFD_CMD] + OPSICONFD_RESTORE + [filename], check=True)

    # delete backup file
    os.remove(filename)
    print("Backup restored and file removed.")
    # subprocess.run([OPSICONFD_CMD] + OPSICONFD_RESTORE, check=True)


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
    kill_opsiconfd_processes()
    try:
        restore_backup()
    except Exception as e:
        print(f"error restoring backup: {e}", file=sys.stderr)

    try:
        subprocess.run([OPSICONFD_CMD] + OPSICONFD_RENAME_ARGS, check=False)
        subprocess.run([OPSICONFD_CMD] + ["--version"], check=True)
        ## download backup file from url

        subprocess.run([OPSICONFD_CMD] + OPSICONFD_ARGS, check=True)
    except subprocess.CalledProcessError as e:
        print(f"error starting opsiconfd: {e}", file=sys.stderr)
        sys.exit(e.returncode)


if __name__ == "__main__":
    main()
