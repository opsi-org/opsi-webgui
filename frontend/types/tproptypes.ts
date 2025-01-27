export type PropTypeServerClient = 'servers' | 'clients'
// for translation key search $t('formselect.select.clients'), $t('formselect.select.servers') -->

export const GroupTree_CLIENTGROUP = 'client-group'
export const GroupTree_PRODGROUP = 'product-group'
export type PropTypeGroupTree =
  | typeof GroupTree_CLIENTGROUP
  | typeof GroupTree_PRODGROUP
  | 'infoselections'
  | 'depots'
