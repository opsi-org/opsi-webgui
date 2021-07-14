<template>
  <div>
    <treeselect
      v-model="value"
      :multiple="true"
      :options="options"
      :load-options="loadOptions"
      placeholder="Dummy Hostgroup with delayed loading children"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class TSDelayedLoading extends Vue {
  value: any = null
  children: Array<object> = []
  options: Array<object> = []

  fetch () {
    // TODO: request backend for groups with children:'null'
    // request: Request = { selectedDepots: [], parentGroup: '' }
    // where request.parentGroup = '' // empty string
    // this.hostGroup = Object.values((await this.$axios.$post('/api/opsidata/hosts/groups', JSON.stringify(this.request))).result)
    this.options = [{
      id: '40_gefundene_software',
      label: '40_gefundene_software',
      children: null
    }, {
      id: 'aa_opsiconf_basis',
      label: 'aa_opsiconf_basis',
      children: null
    }, {
      id: 'ab_group',
      label: 'ab_group',
      children: null
    }]
  }

  loadOptions ({ action, parentNode, callback }: any) {
    if (action === 'LOAD_CHILDREN_OPTIONS') {
      parentNode.children = this.loadChildren(parentNode.id)
      callback()
    }
  }

  // TODO: Again request backend
  // request: Request = { selectedDepots: [], parentGroup: '' }
  // where request.parentGroup = this.parentId
  // this.hostGroup = Object.values((await this.$axios.$post('/api/opsidata/hosts/groups', JSON.stringify(this.request))).result)
  loadChildren (parentId: string) {
    if (parentId === '40_gefundene_software') {
      this.children = [{
        id: 'windows_treiberpaket',
        label: 'windows_treiberpaket',
        children: null
      }]
    }
    if (parentId === 'windows_treiberpaket') {
      this.children = [{
        id: 'dummy1.uib.local',
        label: 'dummy1.uib.local',
        type: 'ObjectToGroup'
      }, {
        id: 'dummy2.uib.local',
        label: 'dummy1.uib.local',
        type: 'ObjectToGroup'
      },
      {
        id: 'dummy3.uib.local',
        label: 'dummy1.uib.local',
        type: 'ObjectToGroup'
      }]
    }
    if (parentId === 'aa_opsiconf_basis') {
      this.children = this.children = [{
        id: 'dummy4.uib.local',
        label: 'dummy1.uib.local',
        type: 'ObjectToGroup'
      }, {
        id: 'dummy5.uib.local',
        label: 'dummy1.uib.local',
        type: 'ObjectToGroup'
      },
      {
        id: 'dummy6.uib.local',
        label: 'dummy1.uib.local',
        type: 'ObjectToGroup'
      }]
    }
    if (parentId === 'ab_group') {
      this.children = []
    }
    return this.children
  }
}
</script>

<style>

</style>
