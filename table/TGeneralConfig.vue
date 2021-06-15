<template>
  <!-- TODO: Replace tableitems with real data from backend  -->
  <TableTDefault :tableitems="tableitems" />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class TGeneralConfig extends Vue {
  tableitems:Array<object> = []

  fetch () {
    this.tableitems = [
      { property: 'Description', value: '' },
      { property: 'Inventory Number', value: '' },
      { property: 'MAC Address', value: '' },
      { property: 'Install by shutdown', value: 'true', type: 'switch' },
      { property: 'UEFI Boot', value: 'true', type: 'boolean' },
      { property: 'WAN Configuration', value: 'false', type: 'boolean' },
      { property: 'One Time password', value: '' },
      { property: 'opsiHostKey', value: '123456' },
      { property: 'Notes', value: '' }
    ]
  }
}
</script>

<style>

</style>
