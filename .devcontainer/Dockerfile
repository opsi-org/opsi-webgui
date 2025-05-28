FROM node:23.0.0-bookworm-slim


# System deps:
RUN apt-get update \
	&& apt-get --yes dist-upgrade \
	&& apt-get --yes --allow-downgrades install \
		docker.io \
		cpio \
		htop \
		sudo \
		wget \
		zsh \
		bash-completion \
		git \
		vim \
		nano \
	&& apt-get clean

ARG HOSTNAME
ARG DEV_USER
ARG DEV_GIT_EMAIL
ARG DEV_GIT_NAME


RUN sh -c "$(wget -O- https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" \
	&& sed -i '1i export TERM=xterm-256color' /root/.zshrc \
	&& usermod -s /usr/bin/zsh root


RUN git config --global --add safe.directory /workspace
RUN git config --global user.name "${DEV_GIT_NAME}"
RUN git config --global user.email "${DEV_GIT_EMAIL}"


RUN echo 'alias opsiconfdrestart="docker exec -u root $(docker ps --format "{{.Names}}" | grep gui | grep server | grep opsi) supervisorctl reload"' >> /root/.zshrc
RUN echo 'alias opsiconfdcontainer="docker exec -u root $(docker ps --format "{{.Names}}" | grep gui | grep server | grep opsi)"'  >> /root/.zshrc
WORKDIR /workspace/frontend

RUN npm completion >> ~/.zshrc

RUN npx -y playwright@1.49.1 install --with-deps


RUN npm install -g n

RUN export NODE_OPTIONS='--disable-warning=ExperimentalWarning'

USER root
CMD ["/usr/bin/zsh"]