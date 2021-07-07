<template>
  <treeselect
    v-model="groupSelection"
    :placeholder="type === 'hostgroup' ? 'Host Group' : 'Product Group'"
    class="treeselect"
    :multiple="true"
    :clearable="false"
    :options="options"
    :normalizer="normalizer"
    value-format="object"
    :max-height="400"
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
</template>

<script lang="ts">
import { Component, namespace, Watch, Prop, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')

@Component
export default class TSTreeselect extends Vue {
  @Prop({ }) options!: object
  @Prop({ }) type!: string

  groupSelection: Array<any> = []
  groupIdList: Array<string> = []
  item: any

  @selections.Getter public selectionClients!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void
  @selections.Mutation public pushToSelectionClients!: (s: string) => void
  @selections.Mutation public delFromSelectionClients!: (s: string) => void

  @Watch('selectionClients', { deep: true }) selectionClientsChanged () {
    this.syncStoreToTree()
  }

  beforeUpdate () {
    this.filterObjectLabel(this.options, 'ObjectToGroup', 'type', 'text', this.groupIdList)
    this.syncStoreToTree()
  }

  normalizer (node: any) {
    return {
      id: node.id,
      type: node.type,
      label: node.text.replace(/_+$/, ''),
      children: (node.children) ? Object.values(node.children) : {}
    }
  }

  arrEqual (arr1: Array<string>, arr2: Array<string>) {
    return JSON.stringify(arr1) === JSON.stringify(arr2)
  }

  syncStoreToTree () {
    const storeData = this.selectionClients
    let treeData = this.groupSelection.filter(item => item.type === 'ObjectToGroup')
    treeData = [...new Set(treeData)]
    if (this.arrEqual(storeData, treeData)) {
      // eslint-disable-next-line no-useless-return
      return
    }
    const elementsInTree: Array<string> = []
    for (const index in storeData) {
      if (this.groupIdList.includes(storeData[index])) {
        this.filterObject(
          this.options, storeData[index],
          'text', elementsInTree)
      }
    }
    this.groupSelection = elementsInTree
  }

  filterObject (elements: any, matchingValue: string, key: string, resultArray:Array<string>) {
    for (const elementKey in elements) {
      const element = elements[elementKey]
      if (element[key] === matchingValue) {
        resultArray.push(element)
      } else if (element.children != null) {
        this.filterObject(element.children, matchingValue, key, resultArray)
      }
    }
  }

  filterObjectLabel (elements:any, matchingValue: string, compareKey:string, mapKey:string, resultArray:Array<string>) {
    for (const elementKey in elements) {
      const element = elements[elementKey]
      if (element[compareKey] === matchingValue) {
        resultArray.push(element[mapKey])
      } else if (element.children != null) {
        this.filterObjectLabel(element.children, matchingValue, compareKey, mapKey, resultArray)
      }
    }
  }

  groupChange (value: object, type: string) {
    const idList : Array<string> = []
    this.filterObjectLabel([value], 'ObjectToGroup', 'type', 'text', idList)
    const storeData = this.selectionClients

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
.treeselect .vue-treeselect__multi-value-item-container {
  display: none;
}

</style>
