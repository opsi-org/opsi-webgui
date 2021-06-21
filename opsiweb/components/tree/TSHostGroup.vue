<template>
  <div>
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
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')

@Component
export default class TSHostGroup extends Vue {
  groupSelection: Array<object> = []
  hostGroup: Array<object> = []

  @selections.Getter public selectionClients!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void
  @selections.Mutation public pushToSelectionClients!: (s: string) => void
  @selections.Mutation public delFromSelectionClients!: (s: string) => void

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

  groupChange (value: object, type: string) {
    let idList: Array<string> = []
    this.mapElementsByValue([value], 'ObjectToGroup', 'type', 'label', idList)
    idList = [...new Set(idList)]
    let storeData
    storeData = this.selectionClients
    storeData = [...new Set(storeData)]

    for (const i in idList) {
      const objectId = idList[i]
      if (type === 'select') {
        this.pushToSelectionClients(objectId)
      }
      if (type === 'deselect') {
        if (storeData.includes(objectId)) {
          this.delFromSelectionClients(objectId)
        }
      }
    }
  }

  groupSelect (selection: any) {
    this.groupChange(selection, 'select')
  }

  groupDeselect (deselection: object) {
    this.groupChange(deselection, 'deselect')
  }
}
</script>

<style>

</style>
