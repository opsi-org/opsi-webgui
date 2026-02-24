#!/bin/sh
# setup-hosts.sh - Configure /etc/hosts with opsi hostname
echo "[INFO] Setting up /etc/hosts..."

echo "127.0.0.1       ${OPSI_HOSTNAME} $(hostname) mysql redis localhost" > /tmp/hosts
grep -v "127.0.0.1" /etc/hosts | grep -v ${OPSI_HOSTNAME} >> /tmp/hosts
sudo cp /tmp/hosts /etc/hosts
rm /tmp/hosts

echo "[INFO] /etc/hosts configured"
