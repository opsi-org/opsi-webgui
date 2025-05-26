echo "* Running as $(whoami)"

# install_jemalloc() {
# 	echo "* Installing jemalloc"
# 	cd /tmp
# 	wget https://github.com/jemalloc/jemalloc/releases/download/$JEMALLOC_VERSION/jemalloc-$JEMALLOC_VERSION.tar.bz2
# 	tar xvjf jemalloc-$JEMALLOC_VERSION.tar.bz2
# 	cd jemalloc-$JEMALLOC_VERSION
# 	./configure
# 	make
# 	sudo make install
# }

# install uv
#wget -qO- https://astral.sh/uv/install.sh | sh # user context
curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/usr/local/bin" sudo sh # root context
uv self update
sudo echo 'eval "$(uv generate-shell-completion zsh)"' >> /root/.bashrc
sudo echo 'eval "$(uvx --generate-shell-completion zsh)"' >> /root/.bashrc

echo 'eval "$(uv generate-shell-completion zsh)"' >> ~/.bashrc
echo 'eval "$(uvx --generate-shell-completion zsh)"' >> ~/.bashrc



sudo mkdir -p /var/log/opsi
sudo mkdir -p /var/lib/opsi/depot
sudo mkdir -p /var/lib/opsi/public
sudo mkdir -p /var/lib/opsi/repository
sudo mkdir -p /var/lib/opsi/workbench
sudo mkdir -p /var/lib/opsiconfd
sudo mkdir -p /tftpboot
sudo ln -s /workspace/backend/addons /var/lib/opsiconfd/addons

sudo chown -R $DEV_USER /workspace

/workspace/backend/scripts/setup-hosts.sh
/workspace/backend/scripts/setup-grafana.sh
/workspace/backend/scripts/setup-mysql.sh
/workspace/backend/scripts/setup-redis.sh


# use license if available
if [ -f /workspace/docker/test.opsilic ]; then
    sudo cp /workspace/docker/test.opsilic /etc/opsi/licenses/test.opsilic
fi


