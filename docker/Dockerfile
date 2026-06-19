FROM docker.uib.gmbh/opsi/dev/pybuilder:deb10-py3.13

ARG USER
ARG UID
ARG ADDON_NAME
ARG ADDON_ID

ENV DEV_USER=${USER:-dev} \
	DEV_UID=${UID:-1000} \
	ADDON_ID=${ADDON_ID:-webgui} \
	OPSI_REPO=https://download.opensuse.org/repositories/home:/uibmz:/opsi:/4.3:/development/Debian_10/ \
	PYTHONFAULTHANDLER=1 \
	PYTHONUNBUFFERED=1

# System dependencies (single layer, no cache)
RUN mkdir -p /usr/local/share/keyrings \
	&& curl -fsSL $OPSI_REPO/Release.key | gpg --dearmor > /usr/local/share/keyrings/opsi-obs.gpg \
	&& echo "deb [signed-by=/usr/local/share/keyrings/opsi-obs.gpg] $OPSI_REPO/ /" > /etc/apt/sources.list.d/opsi.list \
	&& apt-get update \
	&& apt-get --yes --no-install-recommends install \
	mariadb-client \
	libmariadb-dev \
	librsync1 \
	sudo \
	git \
	netcat \
	supervisor \
	mariadb-server \
	redis-server \
	redis-timeseries \
	opsi-utils \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*

COPY docker/files/ /

# Redis + MySQL runtime dirs
RUN sed -i 's/^daemonize yes/daemonize no/' /etc/redis/redis.conf \
	&& mkdir -p /var/run/redis && chown redis:redis /var/run/redis \
	&& install -m 755 -o mysql -g root -d /var/run/mysqld

# Users and groups
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
	&& echo "${DEV_USER} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers \
	&& cp /root/.bashrc /home/${DEV_USER}/.bashrc \
	&& cp /root/.bash_history /home/${DEV_USER}/.bash_history \
	&& chown -R ${DEV_USER}:${DEV_USER} /home/${DEV_USER}/

# opsi directory structure
RUN mkdir -p /var/lib/opsiconfd/addons \
	/var/lib/opsi/depot \
	/var/lib/opsi/public \
	/var/lib/opsi/repository \
	/var/lib/opsi/workbench \
	/var/lib/opsi/tmp \
	/var/lib/opsi/tmp/file-transfer \
	/var/lib/opsi/backup \
	/var/lib/opsi/ntfs-images \
	/var/log/opsi/opsiconfd \
	/var/log/opsi/bootimage \
	/var/log/opsi/clientconnect \
	/var/log/opsi/instlog \
	/var/log/opsi/userlogin \
	/etc/opsi/ssl \
	/etc/opsi/licenses \
	/tftpboot /workspace \
	&& chown -R opsiconfd:opsifileadmins /var/lib/opsiconfd /var/lib/opsi /var/log/opsi /etc/opsi \
	&& chmod 770 /etc/opsi/ssl /var/lib/opsiconfd /var/lib/opsi \
	&& chown -R ${DEV_USER}:${DEV_USER} /workspace \
	&& chmod +x /entrypoint.sh

# Addon symlink
RUN ln -sf /workspace/backend/${ADDON_ID} /var/lib/opsiconfd/addons/${ADDON_ID}

# Allow opsiconfd user to access uv-installed Python
RUN chmod a+rx /root && mkdir -p /root/.local/share && chmod -R a+rX /root/.local

# Node.js 22 LTS + pnpm
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
	&& apt-get install -y --no-install-recommends nodejs \
	&& npm install -g pnpm \
	&& apt-get clean && rm -rf /var/lib/apt/lists/*

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s \
	CMD curl -fsk https://localhost:4447/admin/healthy || exit 1

WORKDIR /workspace
