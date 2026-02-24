#!/usr/bin/env bash

set -o errexit
set -o nounset

# Start supervisor first (which starts redis and mariadb)
/usr/bin/supervisord -c /etc/supervisor/supervisord.conf &
SUPERVISOR_PID=$!

echo "Waiting for services to start..."
sleep 5

# Wait for MySQL to be ready
echo "Waiting for MariaDB..."
while ! nc -v -z -w3 localhost 3306 >/dev/null 2>&1; do
    sleep 1
done

# Setup MySQL user and database
echo "Setting up MySQL user and database..."
mysql -u root -e "CREATE USER IF NOT EXISTS ${MYSQL_USER:-opsi}@localhost IDENTIFIED BY '${MYSQL_PASSWORD:-opsi}';"
mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO ${MYSQL_USER:-opsi}@localhost IDENTIFIED BY '${MYSQL_PASSWORD:-opsi}';"
mysql -u root -e "FLUSH PRIVILEGES"
mysql -u root -e "CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE:-opsi};"

echo "Services ready."

# Wait for supervisor to continue running
wait $SUPERVISOR_PID
