<template>
  <ViewVConfig :id="id" :as-child="false" :type="type">
    <template slot="IDSelection">
      <TreeTSDepotsNotStored
        :id.sync="id"
        :empty-allowed="true"
        :tooltip-empty-allowed="$t('tooltip.server-config.clear')"
        cssclass="treeselect_short" />
    </template>
  </ViewVConfig>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PDepotsConfig extends Vue {
  id: string = ''
  type: string = 'depots'
}
</script>
