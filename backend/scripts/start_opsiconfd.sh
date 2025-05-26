#!/bin/bash
if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Not running as root"
    exit
fi

set -x
set -e
TIMEOUT=10
OPSICONFD=opsiconfd
echo "Sende SIGTERM an alle opsiconfd-Prozesse..."
#pkill -f "[o]psiconfd"
pgrep -f "[o]psiconfd" | grep -v $$ | xargs -r kill
#pkill -f "[o]psiconfd" --signal SIGTERM --inverse --parent 1
echo "Alle opsiconfd-Prozesse wurden beendet."

# Warten mit Timeout, ob Prozesse verschwinden
echo "Warten auf Beendigung... ($TIMEOUT Sekunden)"
for i in {1..$TIMEOUT}; do
    sleep 1
    if ! pgrep -f '[o]psiconfd' > /dev/null; then
        echo "Alle Prozesse erfolgreich beendet."
        break
    fi
done

echo "run opsiconfd"
cd /workspace/docker/backend/opsiconfd
/root/.local/bin/uv run -m opsiconfd \
    --workers=1 \
    --log-mode=redis \
    --log-level-stderr=5 \
    --addon-dirs=/workspace/backend/addon \
    --static-dir=/workspace/docker/backend/opsiconfd/opsiconfd_data/static


