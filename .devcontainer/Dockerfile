
FROM mcr.microsoft.com/playwright:v1.38.0-jammy
#FROM mcr.microsoft.com/playwright:v1.49.0-noble
# System deps:
RUN apt-get update \
	&& apt-get --yes dist-upgrade \
	&& apt-get --yes --allow-downgrades install \
		docker.io \
		cpio \
		sudo \
		wget \
		zsh \
		bash-completion \
		git \
		vim \
		nano \
	&& apt-get clean
# defined in docker-compose and .env
ARG HOSTNAME
ARG DEV_USER
ARG DEV_GIT_EMAIL
ARG DEV_GIT_NAME

# RUN echo 'Setup /etc/hosts' 1>&2
# RUN echo "127.0.0.1       ${HOSTNAME} $(hostname) mysql redis grafana localhost" > /tmp/hosts
# RUN grep -v "127.0.0.1" /etc/hosts | grep -v ${HOSTNAME} >> /tmp/hosts
# RUN cp /tmp/hosts /etc/hosts
# RUN rm /tmp/hosts


RUN sh -c "$(wget -O- https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" \
	# && git clone https://github.com/zsh-users/zsh-autosuggestions /root/.oh-my-zsh/custom/plugins/zsh-autosuggestions \
	&& sed -i '1i export TERM=xterm-256color' /root/.zshrc \
	# && sed -i s'/^plugins.*/plugins=(git zsh-autosuggestions history)/' /root/.zshrc \
	&& usermod -s /usr/bin/zsh root


# RUN useradd --create-home -s /usr/bin/zsh ${DEV_USER}
RUN git config --global --add safe.directory /workspace
RUN git config --global user.name "${DEV_GIT_NAME}"
RUN git config --global user.email "${DEV_GIT_EMAIL}"


# RUN wget http://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/opsi-dev-tools_linux_x64_1.16.3.tar.gz
# RUN tar -xf opsi-dev-tools_linux_x64_1.16.3.tar.gz \
# 	&& ./opsi-dev-tool --self-install


RUN npm install -g n
RUN n lts

WORKDIR /workspace/
# USER ${DEV_USER}
USER root
CMD ["/usr/bin/zsh"]