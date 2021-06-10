<template>
  <div>
    <!-- TODO: Replace tableitems with real data from backend  -->
    <BarBPageHeader v-if="asChild" :title="'Config - ' + id" :closeroute="closeroute" />
    <BarBPageHeader v-if="!asChild">
      <template #selection>
        <b-form-select />
      </template>
    </BarBPageHeader>
    <IconILoading v-if="isLoading" />
    <template v-else>
      <TableTDefault :tableitems="tableitems" />
      <template v-if="id === opsiconfigserver">
        Hello from config server
        <!-- <span v-for="catogery in hostparam" :key="catogery.title">
          {{ category }} -->
          <!-- <CollapseCTable :title="catogery.title" :tableitems="catogery.items" /> -->
        <!-- </span> -->
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class VClientConfig extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string
  @Prop({ default: false }) 'asConfigDepot'!: string

  isLoading: boolean = false
  tableitems:Array<object> = []
  hostparam:Array<object> = []
  opsiconfigserver: string = ''

  beforeMount () {
    this.getConfig()
    if (this.id === this.opsiconfigserver) {
      this.getHostParam()
    }
  }

  getConfig () {
    this.isLoading = true
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
    this.isLoading = false
  }

  getHostParam () {
    this.hostparam = [
      {
        title: '',
        items: [
          { property: 'clientinfo.regvalue1', value: '' },
          { property: 'license-management.use', value: 'false', type: 'boolean' }
        ]
      },
      {
        title: 'clientconfig',
        items: [
          { property: 'clientconfig.capture', value: '' },
          { property: 'clientconfig.configserver', value: '' },
          { property: 'clientconfig.depot.drive', value: 'true', type: 'boolean' },
          { property: 'clientconfig.depot.id', value: '' }
        ]
      },
      {
        title: 'configed',
        items: [
          { property: 'configed.capture', value: '' },
          { property: 'configed.configserver', value: '' },
          { property: 'configed.depot.id', value: '' }
        ]
      }
    ]
    this.isLoading = false
  }

  async fetch () {
    this.opsiconfigserver = (await this.$axios.$post('/api/user/opsiserver')).result
  }
}
</script>

<style>

</style>
