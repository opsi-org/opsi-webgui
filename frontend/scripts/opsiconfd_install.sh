#!/bin/bash
set -e
echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Starting environment setup script"
echo "Current working directory: $(pwd)"
echo "Environment variables:"
echo "  OPSI_MAJOR_VERSION=${OPSI_MAJOR_VERSION}"
echo "  OPSILICSRV_TOKEN=${OPSILICSRV_TOKEN:+***}"
echo "  MYSQL_HOST=${MYSQL_HOST}"
echo "  MYSQL_DATABASE=${MYSQL_DATABASE}"
echo "  MYSQL_USER=${MYSQL_USER}"
echo "  OPSICONFD_LOG_LEVEL=${OPSICONFD_LOG_LEVEL}"
echo "  OPSI_ADMINUSER=${OPSI_ADMINUSER}"
echo "  OPSI_ADMINPW=${OPSI_ADMINPW:+***}"
##########################################################
############################### set default environment variables
##########################################################
## needed environment variables:
OPSI_MAJOR_VERSION=${OPSI_MAJOR_VERSION:-4.3}
OPSILICSRV_TOKEN=${OPSILICSRV_TOKEN:-}
MYSQL_HOST=${MYSQL_HOST:-mysql}
MYSQL_DATABASE=${MYSQL_DATABASE:-opsitest}
MYSQL_USER=${MYSQL_USER:-opsi}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-opsi}
OPSICONFD_LOG_LEVEL=${OPSICONFD_LOG_LEVEL:-info}
OPSI_ADMINUSER=${OPSI_ADMINUSER:-adminuser}
OPSI_ADMINPW=${OPSI_ADMINPW:-adminuser}

SUDO=""
IS_CICD=${CI:-false}
if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
  echo "Not running as root, using sudo for commands that need elevated permissions"
  if [ "$IS_CICD" = "true" ]; then
    echo "In CICD environment but not running as root, exiting"
    exit 1
  fi
fi
##########################################################
#################################### install dependencies
##########################################################
$SUDO apt update
$SUDO apt -y install git sudo inetutils-ping mariadb-client default-libmysqlclient-dev
#$SUDO apt -y install debhelper osc bc git wget python3 python3-pip python3-dev python3-venv iproute2 net-tools iputils-ping
#$SUDO apt -y install mariadb-client default-libmysqlclient-dev build-essential
$SUDO apt -y install libxslt-dev python3-lxml
$SUDO apt -y install build-essential pkg-config libxml2-dev libxmlsec1-dev libxmlsec1-openssl

##########################################################
##################################### setup opsiconfd repo
##########################################################
echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> install opsiconfd from repo"
git clone --branch "v${OPSI_MAJOR_VERSION}"  "https://gitlab-ci-token:${CI_JOB_TOKEN}@gitlab.uib.gmbh/uib/opsiconfd.git"
ls -lah
# Get new tags from remote
cd opsiconfd
if [ "$IS_CICD" = "true" ]; then
  git fetch --tags
  echo ">>>> fetching latest opsiconfd tag"
  echo "SHELL: $SHELL"
  echo "OPSI_MAJOR_VERSION='${OPSI_MAJOR_VERSION}'"
  git --version || true
  latestTag=$(git tag -l "$OPSI_MAJOR_VERSION*" --sort=-creatordate | head -n1) || true
  echo "Opsiconfd: $latestTag"
  git checkout "$latestTag"
  cd -
fi

##########################################################
###################################### configure opsiconfd
##########################################################
cd opsiconfd
echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> configure opsiconfd"
[ -e /etc/opsi ] && rm -r /etc/opsi
cp -a opsiconfd_data/etc /etc/opsi

# Configure opsiconfd
mkdir -p /var/lib/opsi/repository /var/lib/opsi/depot
export OPSICONFD_MYSQL_INTERNAL_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:3306/${MYSQL_DATABASE}"
echo "mysql-internal-url = ${OPSICONFD_MYSQL_INTERNAL_URL}" >> tests/data/default-opsiconfd.conf
echo "mysql internal url: $OPSICONFD_MYSQL_INTERNAL_URL"
echo ">>>>> opsiconfd config"
cat tests/data/default-opsiconfd.conf

echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> setup users and groups"
$SUDO groupadd -g 2001 opsifileadmins
$SUDO groupadd -g 2002 opsiadmin
$SUDO useradd --system -g opsifileadmins -d /var/lib/opsi -s /bin/bash opsiconfd -G opsiadmin

$SUDO useradd "${OPSI_ADMINUSER}"
echo "${OPSI_ADMINUSER}:${OPSI_ADMINPW}" | chpasswd
$SUDO adduser "${OPSI_ADMINUSER}" opsiadmin

# Installing opsi test modules file
echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> get license"
mkdir -p /etc/opsi/licenses
if [ ! -z "$OPSILICSRV_TOKEN" ]; then
  wget --header="Authorization: Bearer ${OPSILICSRV_TOKEN}" "https://opsi-license-server.uib.gmbh/api/v1/licenses/test?usage=opsiconfd-gitlab-ci" -O /etc/opsi/licenses/test.opsilic
fi

# Create dirs
mkdir -p /var/log/opsi/clientconnect
mkdir -p /var/lib/opsi/public
mkdir -p /tftpboot

# Grant full database access to opsi user
echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> configure mysql"
mysql --host=mysql --user=root --password=opsi -e "GRANT ALL ON opsitest.* TO 'opsi'@'%';"
echo "internal url: $OPSICONFD_MYSQL_INTERNAL_URL"

# install opsiconfd
echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> install python dependencies"
rm -rf .venv
uv sync --frozen

echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> setup opsiconfd"
echo "opsiconfd loglevel: ${OPSICONFD_LOG_LEVEL}"
uv run opsiconfd -c tests/data/default-opsiconfd.conf setup -l6

sleep 20
cd -
