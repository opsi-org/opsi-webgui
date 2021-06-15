<template>
  <!-- TODO: Replace configserver's hostparam with real data from backend  -->
  <div>
    <span v-for="catogery in hostparam" :key="catogery.title">
      <CollapseCTable :title="catogery.title" :tableitems="catogery.items" />
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class THostParam extends Vue {
  hostparam:Array<object> = []

  fetch () {
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
  }
}
</script>

<style>

</style>
