
#!/bin/bash

sed -i "/^\([[:space:]]*\"version\": \).*/s//\1\"$@\",/" /workspace/opsiweb/package-dry.json
sed -i "/^\([[:space:]]*version: \).*/s//\1$@/" /workspace/opsi-dev-tool.yml
