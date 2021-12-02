#!/bin/sh
echo OPSICONFD_GRAFANA_EXTERNAL_URL=http://$(hostname -f):3000 > .env
echo OPSI_HOSTNAME=$(hostname -f) >> .env
echo OPSI_DOMAIN=$(hostname -d) >> .env

if [ -z ${USER+x} ]; then
	echo DEV_USER=$DEV_USER >> .env
else
	echo DEV_USER=$USER >> .env
fi

# TODO: Update this
# git clone git@gitlab.uib.gmbh:uib/opsiweb-ui-components.git opsiweb/components
# echo ""
# echo "Attention! "
# echo "Please check if opsiweb/components directory is filled. "
# echo "Otherwise clone it with e.g. "
# echo "\tgit clone git@gitlab.uib.gmbh:uib/opsiweb-ui-components.git opsiweb/components"
