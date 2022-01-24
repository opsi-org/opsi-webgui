
#!/bin/bash
npm install -g json
json -I -f /workspace/opsiweb/package-dry.json -e "this.version=\"$@\""
sed -i "/^\([[:space:]]*version: \).*/s//\1$@/" /workspace/opsi-dev-tool.yml
