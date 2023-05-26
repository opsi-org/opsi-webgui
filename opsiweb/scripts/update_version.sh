
#!/bin/bash

sed -i "/^\([[:space:]]*\"version\": \).*/s//\1\"$@\",/" /workspace/opsiweb/package.json
sed -i "/^\([[:space:]]*version: &project_version \).*/s//\1$@/" /workspace/opsi-dev-tool.yml
