<template>
  <TreeTSTreeselect :options="hostGroup" :type="'hostgroup'" />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class TSHostGroup extends Vue {
  hostGroup: Array<object> = []

  fetch () {
    // TODO: Need backend method like '/api/opsidata/hostgroup' for fetching hostgroups for the selectedDepotsList
    // this.hostGroup = (await this.$axios.$post('/api/opsidata/hostgroup', selectedDepotsList)).result
    this.hostGroup = [
      {
        id: '40_gefundene_software',
        label: '40_gefundene_software',
        type: 'HostGroup',
        children: [
          {
            id: 'agorumcore-tst.uib.local;40_gefundene_software',
            label: 'agorumcore-tst.uib.local',
            type: 'ObjectToGroup'
          },
          {
            id: 'akunde1.uib.local;40_gefundene_software',
            label: 'akunde1.uib.local',
            type: 'ObjectToGroup'
          },
          {
            id: 'testgroup1;40_gefundene_software',
            label: 'testgroup1',
            type: 'HostGroup',
            children: [
              {
                id: 'customibmtm62.uib.local;testgroup1',
                label: 'customibmtm62.uib.local',
                type: 'ObjectToGroup'
              },
              {
                id: 'noteabdul.uib.local;testgroup1',
                label: 'noteabdul.uib.local',
                type: 'ObjectToGroup'
              }
            ]
          },
          {
            id: 'testgroup2;40_gefundene_software',
            label: 'testgroup2',
            type: 'HostGroup',
            children: [
              {
                id: 'akunde1.uib.local;testgroup2',
                label: 'akunde1.uib.local',
                type: 'ObjectToGroup'
              }
            ]
          }
        ]
      }
    ]
  }
}
</script>

<style>

</style>
