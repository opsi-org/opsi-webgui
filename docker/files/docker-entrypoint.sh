#!/usr/bin/env sh

set -o errexit
set -o nounset

cmd="/usr/bin/supervisord -c /etc/supervisor/supervisord.conf"
exec $cmd