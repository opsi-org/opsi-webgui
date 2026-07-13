sudo tail -f /var/log/opsi/opsiconfd/stderr.log
sudo supervisorctl status
sudo supervisorctl restart opsiconfd
sudo supervisorctl stop opsiconfd
sudo supervisorctl start opsiconfd
reload-opsiconf
curl -sk https://localhost:4447/admin/healthy
curl -sk -u adminuser:adminuser https://localhost:4447/addons/webgui/api/user/opsiserver
cd /workspace/frontend && pnpm install && pnpm dev
cd /workspace/frontend && pnpm dev
/workspace/scripts/restore-backup.sh
cd /workspace/docker/opsiconfd && .venv/bin/python -m pytest --cov=/workspace/backend/webgui --cov-report=term  --cov-report=xml:/workspace/backend/coverage.xml /workspace/backend/tests