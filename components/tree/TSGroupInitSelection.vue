<template>
  <div data-testid="TSGroupInitSelection">
    <treeselect
      v-if="groupIds"
      v-model="idselection"
      :multiple="true"
      class="treeselect_notstored"
      :options="groupIds"
      :placeholder="$t('treeselect.assigntoGroups')"
      :always-open="false"
      @input="$emit('update:id', idselection)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class TSGroupInitSelection extends Vue {
  $axios: any

  groupIds: Array<object> = []
  idselection: any = null

  async fetch () {
    const hostgroups: Array<object> = []
    const result = (await this.$axios.$get('/api/opsidata/hosts/groups/id')).sort()
    for (const c in result) {
      const host = result[c]
      hostgroups.push({ id: host, label: host })
    }
    this.groupIds = hostgroups
  }
}
</script>
