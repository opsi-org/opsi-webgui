<template>
  <treeselect
    v-model="groupSelection"
    :placeholder="$t(placeholder)"
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
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')

@Component
export default class TSTreeselect extends Vue {
  @Prop({ }) options!: object
  @Prop({ }) type!: string
  @Prop({ }) placeholder!: string

  groupSelection: Array<any> = []
  groupIdList: Array<string> = []
  item: any
  storeData : Array<string> = []

  // @selections.Getter public selectionClients!: Array<string>
  // @selections.Mutation public pushToSelectionClients!: (s: string) => void
  // @selections.Mutation public delFromSelectionClients!: (s: string) => void
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public pushToSelectionProducts!: (s: string) => void
  @selections.Mutation public delFromSelectionProducts!: (s: string) => void

  // @Watch('selectionClients', { deep: true }) selectionClientsChanged () {
  //   this.syncStoreToTree()
  // }

  beforeUpdate () {
    // if (this.type === 'hostgroup') { this.storeData = this.selectionClients } else { this.storeData = this.selectionProducts }
    this.storeData = this.selectionProducts
    this.filterObjectLabel(this.options, 'ObjectToGroup', 'type', 'text', this.groupIdList)
    this.syncStoreToTree()
  }

  normalizer (node: any) {
    return {
      id: node.id,
      type: node.type,
      label: node.text.replace(/_+$/, ''),
      children: (node.children)
        ? Object.values(node.children).sort(function (a: any, b: any) {
          if (a.text < b.text) { return -1 }
          if (a.text > b.text) { return 1 }
          return 0
        })
        : {}
    }
  }

  arrEqual (arr1: Array<string>, arr2: Array<string>) {
    return JSON.stringify(arr1) === JSON.stringify(arr2)
  }

  syncStoreToTree () {
    let treeData = this.groupSelection.filter(item => item.type === 'ObjectToGroup')
    treeData = [...new Set(treeData)]
    if (this.arrEqual(this.storeData, treeData)) {
      // eslint-disable-next-line no-useless-return
      return
    }
    const elementsInTree: Array<string> = []
    for (const index in this.storeData) {
      if (this.groupIdList.includes(this.storeData[index])) {
        this.filterObject(
          this.options, this.storeData[index],
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

    for (const i in idList) {
      const objectId = idList[i]
      if (type === 'select') {
        this.pushToSelectionProducts(objectId)
        // if (this.type === 'hostgroup') { this.pushToSelectionClients(objectId) } else { this.pushToSelectionProducts(objectId) }
      }
      if (type === 'deselect') {
        if (this.storeData.includes(objectId)) {
          this.delFromSelectionProducts(objectId)
          // if (this.type === 'hostgroup') { this.delFromSelectionClients(objectId) } else { this.delFromSelectionProducts(objectId) }
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
