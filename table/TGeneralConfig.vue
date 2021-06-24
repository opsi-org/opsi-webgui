<template>
  <TableTDefault :tableitems="Object.values(tableitems)" />
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'nuxt-property-decorator'

@Component
export default class TGeneralConfig extends Vue {
  @Prop({ }) id!: string
  tableitems:Object = {}
  dummyresult: Object = {}

  @Watch('id', { deep: true }) idChanged () { this.$fetch() }

  // TODO: A backend method for retrieving 'host_getObjects' result for given id

  fetch () {
    this.dummyresult = {
      id: { property: 'id', value: this.id },
      description: { property: 'description', value: '' },
      hardwareAddress: { property: 'hardwareAddress', value: '' },
      ipAddress: { property: 'ipAddress', value: '' },
      inventoryNumber: { property: 'inventoryNumber', value: '' },
      opsiHostKey: { property: 'opsiHostKey', value: '123456' },
      notes: { property: 'notes', value: '' }
    }
    this.tableitems = this.dummyresult
  }
}
</script>

<style>

</style>
