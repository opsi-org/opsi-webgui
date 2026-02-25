sudo supervisorctl status
sudo supervisorctl start opsiconfd
sudo supervisorctl stop opsiconfd
sudo supervisorctl restart opsiconfd
sudo tail -f /var/log/opsi/opsiconfd/stderr.log
sudo tail -f /var/log/opsi/opsiconfd/opsiconfd.log


