
#!/bin/bash

# apt update
# apt -y install debhelper osc
# wget http://binaryindex.uib.gmbh/development/opsi-dev-tools/linux/x64/opsi-dev-tools_linux_x64_1.0.79.tar.gz
# tar -xf opsi-dev-tools_linux_x64_1.0.79.tar.gz

cd /workspace/opsiweb/
rm -rf /workspace/opsiweb/dist

npm run generate-nossl
mkdir -p webgui
rm -rf opsi-webgui.zip

chmod 770 /workspace/backend/addon/changelogs.md
chown opsiconfd:pwuser /workspace/backend/addon/changelogs.md
mkdir -p /workspace/backend/addon/webgui/data
mkdir -p /workspace/backend/addon/webgui/data/app
cp -r /workspace/opsiweb/dist/* /workspace/backend/addon/webgui/data/app/


mkdir -p webgui
cp -r /workspace/backend/addon/webgui/* webgui/

chown 1000:1000 -R webgui
apt install -y zip
zip -r -q opsi-webgui.zip webgui
chown 1000:1000 opsi-webgui.zip


rm -rf /var/lib/opsiconfd/addons/webgui
# rm -rf /workspace/opsiweb/dist

mv -f webgui/ /var/lib/opsiconfd/addons/.

git restore /workspace/backend/addon/webgui/data/app/README.md
cd -