# bgprevent-opsi-webgui

This repository contains the opsi Client Migration Tool, which helps administrators migrate their existing opsi clients to a new opsi server. The tool is designed to simplify the migration process and ensure a smooth transition for users. This is an opsiconfd addon that provides a web-based interface.

It is part of the larger opsi project, an open-source client management system for Windows and Linux clients.
For more information about opsi, visit the official website: https://opsi.org/

## Installation

You can install these via the admin interface under the ‘Addons’ tab (similar to the description for the web GUI https://docs.opsi.org/opsi-docs-de/4.3/gui/webgui/installation.html#opsiwebgui-installation-admininterface). The add-on is then accessible at https://<configserver>/addons/opsi-webgui/app/.

## Configuration

When the add-on is installed, a configuration file is automatically created on the server under `/etc/opsi/opsiconfd-addon-opsi-webgui.yaml`, in which the product lists in particular can be customised. The following entries are currently the default (even if they are not explicitly stated in the file):

```yaml
# Location of this config file: /etc/opsi/opsiconfd-addon-opsi-webgui.yaml
log:
  path: ‘/var/log/opsi/opsiconfd/addons/opsi-webgui’
  level: ‘INFO’ # DEBUG, INFO, WARNING, ERROR, CRITICAL
  rotate-max-bytes: 10485760 # 10 MB
  rotate-backup-count: 5

client-id-prefix:
  old: ‘bad-’
  new: ‘bgp-device-’

products: # Lists of productIds
  allowed: []
  must-have: []
# For example: [‘opsi-cli’, ‘opsi-configed’, ...]
# or:
#    allowed:
#        - opsi-cli
#        - opsi-configed
```

## Permissions

### Configuration file

To prevent unauthorised persons from editing the file, a Unix group can be created and assigned to the file. The group contains the users who are allowed to edit the configuration file. The user “opsiconfd” only has read access to the file (after its initial creation). If he is the owner of the file, he does not need to be in this group.

### Add-on user permissions

Currently, all opsiadmins can use the add-on (provided they know the URL or can find it on the admin interface). This was discussed at the kick-off meeting. If there is a need to restrict this, we are happy to discuss it.

Logging: In addition to the existing logging of the opsiconfd, there is a type of event logging with a separate log level. The aim is to be able to track which user did what and when – without going into too much detail. Example during a migration

```
[6] [2026-01-22 12:43:03.047] [opsi-webgui] [adminuser    ] Start opsi-webgui (old-client: pytest-client-5.domain.local , new-client: pytest-host-12.domain.local , new-server: pytest-opsi-2.uib.local , product_ids: ['pytest-prod-1', 'pytest-prod-5'] , on-demand: False, delete-old: False)   (clients.py:100)
[6] [2026-01-22 12:43:03.298] [opsi-webgui] [adminuser    ] Migration done for client pytest-host-12.domain.local. Products skipped/failed: []   (clients.py:165)
```

## Client lists

The left side shows all clients whose prefix is ‘bad-’. The right client side filters by the prefix ‘bgp-device-’ and an empty client description to distinguish which client has already been migrated. This is because the description is a mandatory field during migration.

## Migration

All products selected in the interface are set to setup, plus their dependencies. The selection options are (in principle) based on the ProductOnDepots of the (new) depot, depending on the list of fundamentally permitted and must-have products. Properties: All ProductPropertyStates of the old client (the selected products) are moved (even if they have the same value in principle).
After migration confirmation and thus setting the description, new depots if necessary, the products, properties, and on_demand if necessary, the old client is deleted and the licences used (in licence management) are released.
