
#!/bin/bash

# apt update
# apt -y install debhelper osc
# wget http://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/opsi-dev-tools_linux_x64_1.0.79.tar.gz
# tar -xf opsi-dev-tools_linux_x64_1.0.79.tar.gz

cd /workspace/opsiweb/
if [ -f "/workspace/opsiweb/package.json" ];
then
    npm-uib run generate
else
    npm run generate
fi

mkdir -p webgui

# # copy python files
# cp -r /workspace/backend/addon/webgui/* webgui/.

# # copy ui files
# mkdir -p webgui/data
# mkdir -p webgui/data/app
# cp -r /workspace/opsiweb/dist/* webgui/data/app/

# # remove addon folder if already exists
# rm -rf /var/lib/opsiconfd/addons/webgui

# # move new created webgui folder to system
# mv -f webgui/ /var/lib/opsiconfd/addons/.


mkdir -p /workspace/backend/addon/webgui/data
mkdir -p /workspace/backend/addon/webgui/data/app
cp -r /workspace/opsiweb/dist/* /workspace/backend/addon/webgui/data/app/


mkdir -p webgui
cp -r /workspace/backend/addon/webgui/* webgui/

chown 1000:1000 -R webgui
apt install -y zip
zip -r opsi-webgui.zip webgui
chown 1000:1000 opsi-webgui.zip


rm -rf /var/lib/opsiconfd/addons/webgui
rm -rf /workspace/opsiweb/dist

mv -f webgui/ /var/lib/opsiconfd/addons/.


git restore /workspace/backend/addon/webgui/data/app/README.md
cd -