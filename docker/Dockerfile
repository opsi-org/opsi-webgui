FROM docker.uib.gmbh/opsi/dev/pybuilder:deb10-py3.13

# Build args - passed from docker-compose.yml which reads from .env
# These defaults are overridden by values in docker/.env (created by scripts/devenv.sh)
ARG USER
ARG UID
ARG ADDON_NAME
ARG ADDON_ID

ENV DEV_USER=${USER:-dev} \
	DEV_UID=${UID:-1000} \
	ADDON_ID=${ADDON_ID:-webgui} \
	OPSI_REPO=https://download.opensuse.org/repositories/home:/uibmz:/opsi:/4.3:/development/Debian_10/ \
	PYTHONFAULTHANDLER=1 \
	PYTHONUNBUFFERED=1 \
	PYTHONHASHSEED=random \
	PIP_NO_CACHE_DIR=off \
	PIP_DISABLE_PIP_VERSION_CHECK=on \
	PIP_DEFAULT_TIMEOUT=100

# System deps
RUN mkdir -p /usr/local/share/keyrings \
	&& REPO_KEY=/usr/local/share/keyrings/opsi-obs.gpg \
	&& curl -fsSL $OPSI_REPO/Release.key | gpg --dearmor | tee $REPO_KEY > /dev/null \
	&& echo "deb [signed-by=$REPO_KEY] $OPSI_REPO/ /" | tee /etc/apt/sources.list.d/opsi.list \
	&& apt-get update \
	&& apt-get --yes dist-upgrade \
	&& apt-get --yes --allow-downgrades install \
	vim \
	wget \
	mariadb-client \
	libmariadb-dev \
	psmisc \
	librsync1 \
	sudo \
	git \
	nano \
	netcat \
	supervisor \
	mariadb-server \
	redis-tools \
	redis-server \
	redis-timeseries \
	opsi-utils \
	&& apt-get clean

COPY docker/files/ /

# Fix redis config for supervisor (no daemonize)
RUN sed -i 's/^daemonize yes/daemonize no/' /etc/redis/redis.conf \
	&& mkdir -p /var/run/redis && chown redis:redis /var/run/redis \
	&& install -m 755 -o mysql -g root -d /var/run/mysqld

# Setup users - opsiconfd home must be /var/lib/opsi (not /var/lib/opsiconfd/home)
RUN useradd --create-home -s /bin/bash ${DEV_USER} \
	&& (getent group opsifileadmins || groupadd opsifileadmins) \
	&& (getent group opsiadmin || groupadd opsiadmin) \
	&& (getent passwd opsiconfd || useradd --system -g opsifileadmins -d /var/lib/opsi -s /bin/bash opsiconfd) \
	&& (getent passwd pcpatch || useradd --system -g opsifileadmins -d /var/lib/opsi -s /bin/false pcpatch) \
	&& (getent passwd adminuser || useradd --create-home --home-dir /home/adminuser -s /bin/bash adminuser) \
	&& echo "adminuser:adminuser" | chpasswd \
	&& adduser adminuser opsifileadmins \
	&& adduser adminuser opsiadmin \
	&& adduser opsiconfd shadow \
	&& echo "${DEV_USER}:adminuser" | chpasswd \
	&& adduser ${DEV_USER} opsifileadmins \
	&& adduser ${DEV_USER} opsiadmin \
	&& adduser ${DEV_USER} sudo \
	&& adduser ${DEV_USER} shadow \
	&& chown -R ${DEV_USER}:${DEV_USER} /home/${DEV_USER}/ \
	&& echo "${DEV_USER} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers \
	&& (cp -r /root/.bash* /home/adminuser/ 2>/dev/null || true) \
	&& (cp -r /root/.bash* /home/${DEV_USER}/ 2>/dev/null || true) \
	&& chmod g+rw -R . \
	&& chmod +x /*entrypoint.sh \
	&& mkdir -p /tftpboot \
	&& chown -R $DEV_USER:$DEV_USER /workspace

# Create opsi directories with proper permissions
RUN mkdir -p /var/lib/opsiconfd/addons \
	&& mkdir -p /var/lib/opsi/depot \
	&& mkdir -p /var/lib/opsi/public \
	&& mkdir -p /var/lib/opsi/repository \
	&& mkdir -p /var/lib/opsi/workbench \
	&& mkdir -p /var/lib/opsi/tmp \
	&& mkdir -p /var/lib/opsi/tmp/file-transfer \
	&& mkdir -p /var/lib/opsi/backup \
	&& mkdir -p /var/lib/opsi/ntfs-images \
	&& mkdir -p /var/log/opsi/opsiconfd \
	&& mkdir -p /var/log/opsi/bootimage \
	&& mkdir -p /var/log/opsi/clientconnect \
	&& mkdir -p /var/log/opsi/instlog \
	&& mkdir -p /var/log/opsi/userlogin \
	&& mkdir -p /etc/opsi/ssl \
	&& mkdir -p /etc/opsi/licenses \
	&& chown -R opsiconfd:opsifileadmins /var/lib/opsiconfd \
	&& chown -R opsiconfd:opsifileadmins /var/lib/opsi \
	&& chown -R opsiconfd:opsifileadmins /var/log/opsi \
	&& chown -R opsiconfd:opsifileadmins /etc/opsi \
	&& chmod 770 /etc/opsi/ssl \
	&& chmod 770 /var/lib/opsiconfd \
	&& chmod 770 /var/lib/opsi

# Setup addon symlink
RUN rm -f /var/lib/opsiconfd/addons/${ADDON_ID} \
	&& mkdir -p /var/lib/opsiconfd/addons/ \
	&& ln -s /workspace/backend/${ADDON_ID} /var/lib/opsiconfd/addons/${ADDON_ID}

# Allow opsiconfd user to access uv-installed Python
RUN chmod a+rx /root && mkdir -p /root/.local/share && chmod -R a+rX /root/.local

WORKDIR /workspace
