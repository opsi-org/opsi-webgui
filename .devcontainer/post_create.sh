echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Running post_create as $(whoami)"

# install uv
#wget -qO- https://astral.sh/uv/install.sh | sh # user context
curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/usr/local/bin" sudo sh # root context

uv self update



echo "\n" >> ~/.zshrc
echo 'eval "$(uv generate-shell-completion zsh)"' >> ~/.zshrc
echo 'eval "$(uvx --generate-shell-completion zsh)"' >> ~/.zshrc

echo "\n" >> ~/.bashrc
echo 'eval "$(uv generate-shell-completion bash)"' >> ~/.bashrc
echo 'eval "$(uvx --generate-shell-completion bash)"' >> ~/.bashrc

sudo mkdir -p /var/log/opsi
sudo mkdir -p /var/lib/opsi/depot
sudo mkdir -p /var/lib/opsi/public
sudo mkdir -p /var/lib/opsi/repository
sudo mkdir -p /var/lib/opsi/workbench
sudo mkdir -p /var/lib/opsiconfd
sudo mkdir -p /tftpboot

sudo mkdir -p /var/lib/opsiconfd/addons
#sudo ln -s /workspace/backend/addon/webgui /var/lib/opsiconfd/addons/webgui
sudo cp /workspace/backend/addon/webgui /var/lib/opsiconfd/addons/.

sudo chown -R $DEV_USER:$DEV_USER /workspace

/workspace/backend/scripts/setup-hosts.sh
/workspace/backend/scripts/setup-grafana.sh
/workspace/backend/scripts/setup-mysql.sh
/workspace/backend/scripts/setup-redis.sh


# use license if available
if [ -f /workspace/docker/test.opsilic ]; then
    sudo mkdir -p /etc/opsi/licenses
    sudo cp /workspace/docker/test.opsilic /etc/opsi/licenses/test.opsilic
fi


# create  a link which point from /workspace/backend/addons/webgui to /var/lib/opsiconfd/addons/webgui

#sudo ln -s /workspace/backend/addon/webgui /var/lib/opsiconfd/addons/webgui
