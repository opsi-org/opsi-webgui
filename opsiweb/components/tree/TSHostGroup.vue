<template>
  <div>
    <LazyTreeTSTreeselect v-if="hostGroup" :options="hostGroup" :type="'hostgroup'" />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Watch, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')
interface Request {
    selectedDepots: string
    parentGroup: string
}

@Component
export default class TSHostGroup extends Vue {
  request: Request = { selectedDepots: '', parentGroup: '' }
  hostGroup: Array<object> = []
  @selections.Getter public selectionDepots!: Array<string>

  @Watch('selectionDepots', { deep: true }) selectionDepotsChanged () {
    this.$fetch()
  }

  async fetch () {
    this.request.selectedDepots = JSON.stringify(this.selectionDepots)
    // this.request.parentGroup = 'root'
    const params = this.request
    this.hostGroup = Object.values((await this.$axios.$get('/api/opsidata/hosts/groups', { params })).result.groups.children)
  }
}
</script>

<style>

</style>
