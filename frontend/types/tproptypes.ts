/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
export type PropTypeServerClient = 'servers' | 'clients'
// for translation key search $t('formselect.select.clients'), $t('formselect.select.servers') -->

export const GroupTree_CLIENTGROUP = 'client-group'
export const GroupTree_PRODGROUP = 'product-group'
export type PropTypeGroupTree =
  | typeof GroupTree_CLIENTGROUP
  | typeof GroupTree_PRODGROUP
  | 'infoselections'
  | 'depots'
