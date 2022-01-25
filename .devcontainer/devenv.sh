#!/bin/sh
echo OPSICONFD_GRAFANA_EXTERNAL_URL=http://$(hostname -f):3000 > .env
echo OPSI_HOSTNAME=$(hostname -f) >> .env
echo OPSI_DOMAIN=$(hostname -d) >> .env

if [ -z ${USER+x} ]; then
	echo DEV_USER=$DEV_USER >> .env
else
	echo DEV_USER=$USER >> .env
fi

if [ -d .devcontainer ]; then # current dir: /workspace
	git clone --branch=$(git branch --show-current) git@gitlab.uib.gmbh:uib/opsiweb-ui-components.git opsiweb/uib-components
	echo "Please check if opsiweb/uib-components directory is filled. "
elif [ -f devcontainer.json ]; then # current dir: /workspace/.devcontainer
	git clone --branch=$(git branch --show-current) git@gitlab.uib.gmbh:uib/opsiweb-ui-components.git ../opsiweb/uib-components
	echo "Please check if opsiweb/uib-components directory is filled. "
else
	echo ""
	echo "Attention! "
	echo "Please clone repo as opsiweb/uib-components. E.g. with"
	echo "\tgit clone --branch=$(git branch --show-current) git@gitlab.uib.gmbh:uib/opsiweb-ui-components.git opsiweb/uib-components"
<<<<<<< HEAD
=======
fi
>>>>>>> aa19c405cf3bdad526c8490ee1dd7029da672a01
