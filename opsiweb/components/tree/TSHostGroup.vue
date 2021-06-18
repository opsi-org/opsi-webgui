<template>
  <div>
    <!-- <treeselect v-model="value" :multiple="true" :options="options" :max-height="200" /> -->
    <treeselect
      v-model="groupSelection"
      :multiple="true"
      :options="hostGroup"
      value-format="object"
      :max-height="200"
      @select="groupSelect"
      @deselect="groupDeselect"
    >
      <div slot="option-label" slot-scope="{ node }">
        <div :ref="'tree-item-'+node.id">
          <b-icon v-if="node.isBranch" icon="hdd-network-fill" />
          <b-icon v-else icon="laptop" />
          <small> {{ node.label }} </small>
        </div>
      </div>
    </treeselect>
    groupSelection: {{ groupSelection }}
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class TSHostGroup extends Vue {
  idList: Array<string> = []
  groupSelection: Array<object> = []
  hostGroup: Array<object> = []
  // options: any
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
            id: 'agorumcore-tst.uib.local',
            label: 'agorumcore-tst.uib.local',
            type: 'ObjectToGroup'
          },
          // {
          //   id: 'akunde1.uib.local',
          //   label: 'akunde1.uib.local',
          //   type: 'ObjectToGroup'
          // },
          {
            id: 'testgroup1',
            label: 'testgroup1',
            type: 'HostGroup',
            children: [
              {
                id: 'customibmtm62.uib.local',
                label: 'customibmtm62.uib.local',
                type: 'ObjectToGroup'
              },
              {
                id: 'noteabdul.uib.local',
                label: 'noteabdul.uib.local',
                type: 'ObjectToGroup'
              }
            ]
          },
          {
            id: 'testgroup2',
            label: 'testgroup2',
            type: 'HostGroup',
            children: [
              {
                id: 'akunde1.uib.local',
                label: 'akunde1.uib.local',
                type: 'ObjectToGroup'
              }
            ]
          }
        ]
      }
    ]
  }

  mapElementsByValue (elements:any, matchingValue: string, compareKey:string, mapKey:string, resultArray:Array<string>) {
    for (const elementKey in elements) {
      const element = elements[elementKey]
      if (element[compareKey] === matchingValue) {
        resultArray.push(element[mapKey])
      } else if (element.children != null) {
        this.mapElementsByValue(element.children, matchingValue, compareKey, mapKey, resultArray)
      }
    }
  }

  groupSelect (selection: any) {
    // eslint-disable-next-line no-console
    console.log('groupSelect', JSON.stringify(selection))
    this.mapElementsByValue(selection, 'ObjectToGroup', 'type', 'text', this.idList)
    // eslint-disable-next-line no-console
    console.log('idList', JSON.stringify(this.idList))
    // // this.idList = selection.filter((item: any) => item.type === 'ObjectToGroup');
  }

  groupDeselect (deselection: object) {
    // eslint-disable-next-line no-console
    console.log('groupDeselect', deselection)
  }

  // fetch () {
  //   this.options = [{
  //     id: 'a',
  //     label: 'a',
  //     children: [{
  //       id: 'aa',
  //       label: 'aa'
  //     }, {
  //       id: 'ab',
  //       label: 'ab'
  //     }]
  //   }, {
  //     id: 'b',
  //     label: 'b'
  //   }, {
  //     id: 'c',
  //     label: 'c'
  //   }]
  // }
}
</script>

<style>

</style>
