<template>
  <treeselect
    v-model="groupSelection"
    :placeholder="type === 'hostgroup' ? 'Host Group' : 'Product Group'"
    class="treeselect"
    :multiple="true"
    :clearable="false"
    :options="options"
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
</template>

<script lang="ts">
import { Component, namespace, Watch, Prop, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')

@Component
export default class TSTreeselect extends Vue {
  @Prop({ }) options!: Array<object>
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

  mounted () {
    this.filterObjectLabel(this.options, 'ObjectToGroup', 'type', 'label', this.groupIdList)
    this.syncStoreToTree()
  }

  arrEqual (aOrg: Array<string>, bOrg: Array<string>) {
    if (aOrg.length === bOrg.length && aOrg.length === 0) { return true } else if (aOrg.length !== bOrg.length) { return false }
    const a = JSON.parse(JSON.stringify(aOrg))
    const b = JSON.parse(JSON.stringify(bOrg))
    if (a === b) { return true }
    if (a == null || b == null) { return false }
    if (a.length !== b.length) { return false }
    a.sort()
    b.sort()

    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) {
        return false
      }
    }
    return true
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
          'label', elementsInTree)
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
    let idList: Array<string> = []
    this.filterObjectLabel([value], 'ObjectToGroup', 'type', 'label', idList)
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
.treeselect .vue-treeselect__multi-value-item-container {
  display: none;
}

</style>
