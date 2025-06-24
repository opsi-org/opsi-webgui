FROM node:23.0.0-bookworm-slim


ARG HOSTNAME
ARG DEV_USER
ARG DEV_GIT_EMAIL
ARG DEV_GIT_NAME

ENV DOCKER_ENV=${DOCKER_ENV} \
	DEV_USER=${DEV_USER}\
	PATH=/home/${DEV_USER}/.local/bin:/home/${DEV_USER}/bin:$PATH

# delete user node and create new user with the same uid
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#non-root-user
RUN userdel -r node && useradd --create-home -s /bin/bash -u 1000 ${DEV_USER}

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


# give correct user permissions to DEV_USER
RUN	adduser ${DEV_USER} sudo \
	&& chown -R ${DEV_USER}:${DEV_USER} /home/${DEV_USER}/ \
	&& chown -R ${DEV_USER}:${DEV_USER} /workspace \
	&& echo "${DEV_USER} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers \
	&& cp -r /root/.bash* /home/${DEV_USER}/

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


USER $DEV_USER
RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh \
	&& rm -f install.sh
RUN npm completion >> /home/${DEV_USER}/.zshrc

CMD ["/usr/bin/zsh"]