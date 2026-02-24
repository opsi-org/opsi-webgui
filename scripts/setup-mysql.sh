#!/usr/bin/env sh
# setup-mysql.sh - Initialize MySQL/MariaDB for opsi
echo "[INFO] Setting up MySQL..."
echo "[INFO]   Database: ${MYSQL_DATABASE}"
echo "[INFO]   User: ${MYSQL_USER}"

[ -d /var/run/mysqld ] || sudo install -m 755 -o mysql -g root -d /var/run/mysqld

echo "[INFO] Starting MariaDB server..."
sudo supervisorctl start mariadb-server
while ! nc -v -z -w3 localhost 3306 >/dev/null 2>&1; do
    sleep 1
done

echo "[INFO] Creating database user..."
sudo mysql -u root -e "CREATE USER IF NOT EXISTS ${MYSQL_USER}@localhost IDENTIFIED BY '${MYSQL_PASSWORD}';"
sudo mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO ${MYSQL_USER}@localhost IDENTIFIED BY '${MYSQL_PASSWORD}';"
sudo mysql -u root -e "FLUSH PRIVILEGES"

echo "[INFO] Creating database..."
sudo mysql -u root -e "CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE};"

echo "[INFO] MySQL setup complete"
