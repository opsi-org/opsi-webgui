import { tconfigtypes } from '../../types/APItypes';
<script setup lang="ts">
import type { tconfigtypes } from '~/types/APItypes';

const items = {

  'bool-false': { configId: 'license-management.use', description: 'Activate license management', type: 'BoolConfig' as tconfigtypes, value: false, possibleValues: [ false, true ], multiValue: false, editable: false },
  'bool-true': { configId: 'license-management.use', description: 'Activate license management', type: 'BoolConfig' as tconfigtypes, value: true, possibleValues: [ false, true ], multiValue: false, editable: false },

  'unicode-empty': { configId: 'some-entry', description: 'Activate license management', type: 'UnicodeConfig' as tconfigtypes, value: '', possibleValues: [ ], multiValue: false, editable: true },

  'unicode-single-edit': { configId: 'licensing.client_limit_warning_absolute', description: 'Warn when the number of available licenses reaches this value.', type: 'UnicodeConfig' as tconfigtypes, value: '5', possibleValues: [ '5', '6', '7' ], multiValue: false, editable: true, newValue: '', newValues: [] },

  'unicode-single-noedit': {'configId': 'clientconfig.depot.drive', 'description': 'Drive letter for depot share', 'type': 'UnicodeConfig' as tconfigtypes, 'value': 'p:', 'possibleValues': [ 'a:', 'b:', 'c:', 'd:', 'dynamic', 'e:', 'f:', 'g:', 'h:', 'i:', 'j:', 'k:', 'l:', 'm:', 'n:', 'o:', 'p:', 'q:', 'r:', 's:', 't:', 'u:', 'v:', 'w:', 'x:', 'y:', 'z:' ], 'multiValue': false, 'editable': false },

  'unicode-multi-edit': {'configId': 'configed.domains_given', 'description': 'saved domains for creating clients', 'type': 'UnicodeConfig' as tconfigtypes, 'value': [ '0:acme.corp', '1:uib.local' ], 'possibleValues': [ '0:acme.corp', '1:uib.local' ], 'multiValue': true, 'editable': true, 'newValue': '', 'newValues': [] },

  'unicode-multi-noedit': {'configId': 'configed.host_displayfields', 'description': '', 'type': 'UnicodeConfig' as tconfigtypes, 'value': [ 'clientConnected', 'clientDescription', 'clientIPAddress', 'clientLastSeen', 'clientName' ], 'possibleValues': [ 'UEFIboot', 'WANmode', 'clientConnected', 'clientCreated', 'clientDescription', 'clientHardwareAddress', 'clientIPAddress', 'clientInventoryNumber', 'clientLastSeen', 'clientName', 'clientSessionInfo', 'clientSystemUUID', 'depotId', 'installByShutdown' ], 'multiValue': true, 'editable': false },

}

const pushUnique = (arr: Array<any>, val: any) => {
  if (!arr.includes(val)) {
    arr.push(val)
  }
}
const changeValue = (item: any, v: any) => {
  item.value = v
  pushUnique(item.possibleValues, v)
}
const changeItem = (item: any, v: any, index: number) => {changeValue(item, v) }
</script>
<template>
  <Story>

    <Variant title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled>
      <FormrowFRItems
        :items="[items['unicode-empty'], items['unicode-single-edit'], items['unicode-single-noedit'], items['unicode-multi-edit'], items['unicode-multi-noedit']]"
        @change-item="changeItem"
      />
    </Variant>
    <Variant title="desktop" responsive-disabled>
      <FormrowFRItems
        :items="[items['unicode-empty'], items['unicode-single-edit'], items['unicode-single-noedit'], items['unicode-multi-edit'], items['unicode-multi-noedit']]"
        @change-item="changeItem"
      />
    </Variant>
  </Story>
</template>