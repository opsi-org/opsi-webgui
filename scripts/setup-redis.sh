#!/bin/sh
# setup-redis.sh - Configure Redis for opsi
echo "[INFO] Setting up Redis..."

sudo sed -i 's/^daemonize yes/daemonize no/' /etc/redis/redis.conf

echo "[INFO] Redis setup complete"
