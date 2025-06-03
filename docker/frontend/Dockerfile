FROM node:23.0.0-bookworm-slim


ARG HOSTNAME
ARG DEV_USER
ARG DEV_GIT_EMAIL
ARG DEV_GIT_NAME

ENV DOCKER_ENV=${DOCKER_ENV} \
	DEV_USER=${DEV_USER}\
	PATH=/home/${DEV_USER}/.local/bin:/home/${DEV_USER}/bin:$PATH

# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#non-root-user
# rename node user to dev_user
#RUN usermod -d /home/${DEV_USER} -l ${DEV_USER} node  \
#	&& groupmod --new-name ${DEV_USER} node
# delete user node and create new user with the same uid
RUN userdel -r node \
	&& useradd --create-home -s /bin/bash -u 1000 ${DEV_USER}

# System deps:
RUN apt-get update \
	&& apt-get --yes dist-upgrade \
	&& apt-get --yes --allow-downgrades install \
	docker.io \
	curl \
	cpio \
	htop \
	sudo \
	wget \
	zsh \
	bash-completion \
	git \
	vim \
	nano \
	python3 \
	&& apt-get clean


# give correct user permissions
RUN	adduser ${DEV_USER} sudo \
	&& chown -R ${DEV_USER}:${DEV_USER} /home/${DEV_USER}/ \
	&& echo "${DEV_USER} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers \
	&& cp -r /root/.bash* /home/${DEV_USER}/
# renaming node user to the dev user
# this is needed to avoid conflicts with the dev user
#RUN usermod -m -d /home/${DEV_USER} -l $DEV_USER ${NODE_USER} \
#	&& groupmod --new-name ${DEV_USER} ${NODE_USER} \
	#&& usermod -d /my/new/home -m username \
	#&& mkdir /home/${NODE_USER} \
	#&& mkhomedir_helper ${NODE_USER} \
	#usermod -d /newhome/username username

# create node user (with another uid)
#RUN useradd -s /bin/bash -u 1001 ${NODE_USER} \
#	&& usermod -aG sudo ${NODE_USER} \
#	&& chown -R ${NODE_USER}:${NODE_USER} /home/${NODE_USER}/ \
#	&& adduser ${DEV_USER} ${NODE_USER} \
#	&& echo "${NODE_USER} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

#RUN useradd --create-home -s /bin/bash ${DEV_USER} \
#	&&

RUN git config --global --add safe.directory /workspace
RUN git config --global user.name "${DEV_GIT_NAME}"
RUN git config --global user.email "${DEV_GIT_EMAIL}"

WORKDIR /workspace/frontend

RUN chown -R ${DEV_USER} /workspace

RUN npx -y playwright@1.49.1 install --with-deps

RUN npm install -g n
# node version
# RUN n lts
#RUN n 22.12.0
# RUN n 23.0.0

# RUN npm install -g npm # latest
# RUN npm install -g npm@10.9.0 # node 23.0.0
# RUN npm install -g npm@10.9.2
# RUN npm install -g npm@11.0.0

RUN export NODE_OPTIONS='--disable-warning=ExperimentalWarning'


# the user we're applying this too (otherwise it most likely install for root)
USER $DEV_USER
RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh \
	&& rm -f install.sh
RUN npm completion >> /home/${DEV_USER}/.zshrc

CMD ["/usr/bin/zsh"]