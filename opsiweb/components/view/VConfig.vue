<template>
  <div>
    <!-- TODO: Replace tableitems and hostparam(configserver's) with real data from backend  -->
    <BarBPageHeader v-if="asChild" :title="'Config - ' + id" :closeroute="closeroute" />
    <BarBPageHeader v-if="!asChild">
      <template #selection>
        <b-form-select />
      </template>
    </BarBPageHeader>
    <IconILoading v-if="isLoading" />
    <div v-else class="container-fluid result-scrollable">
      <template v-if="id === opsiconfigserver">
        <CollapseCContent title="General">
          <template #content>
            <TableTDefault :tableitems="tableitems" />
          </template>
        </CollapseCContent>
        <CollapseCContent title="Host Parameters">
          <template #content>
            <span v-for="catogery in hostparam" :key="catogery.title">
              <CollapseCTable :title="catogery.title" :tableitems="catogery.items" />
            </span>
          </template>
        </CollapseCContent>
      </template>
      <template v-else>
        <TableTDefault :tableitems="tableitems" />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'nuxt-property-decorator'
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
  }

  @Watch('id', { deep: true }) idChanged () {
    if (this.id === this.opsiconfigserver) {
      this.getHostParam()
    }
  }

  async fetch () {
    this.opsiconfigserver = (await this.$axios.$post('/api/user/opsiserver')).result
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
}
</script>

<style>

</style>
