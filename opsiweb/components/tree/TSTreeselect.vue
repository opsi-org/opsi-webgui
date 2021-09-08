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
import { Component, namespace, Watch, Prop, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')

@Component
export default class TSTreeselect extends Vue {
  @Prop({ }) options!: object
  @Prop({ }) placeholder!: string
  @Prop({ }) type!: string

  groupSelection: Array<any> = []
  groupIdList: Array<string> = []

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public pushToSelectionDepots!: (s: string) => void
  @selections.Mutation public delFromSelectionDepots!: (s: string) => void
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public pushToSelectionProducts!: (s: string) => void
  @selections.Mutation public delFromSelectionProducts!: (s: string) => void

  @Watch('selectionProducts', { deep: true }) selectionProductsChanged () {
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
    let storeSelect: Array<string> = []
    if (this.type === 'depots') { storeSelect = this.selectionDepots } else { storeSelect = this.selectionProducts }
    let treeData = this.groupSelection.filter(item => item.type === 'ObjectToGroup')
    treeData = [...new Set(treeData)]
    if (this.arrEqual(storeSelect, treeData)) {
      // eslint-disable-next-line no-useless-return
      return
    }
    const elementsInTree: Array<string> = []
    for (const index in storeSelect) {
      if (this.groupIdList.includes(storeSelect[index])) {
        this.filterObject(
          this.options, storeSelect[index],
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
    let storeSel: Array<string> = []
    if (this.type === 'depots') { storeSel = this.selectionDepots } else { storeSel = this.selectionProducts }
    this.filterObjectLabel([value], 'ObjectToGroup', 'type', 'text', idList)

    for (const i in idList) {
      const objectId = idList[i]
      if (type === 'select') {
        if (this.type === 'depots') { this.pushToSelectionDepots(objectId) } else { this.pushToSelectionProducts(objectId) }
      }
      if (type === 'deselect') {
        if (storeSel.includes(objectId)) {
          if (this.type === 'depots') { this.delFromSelectionDepots(objectId) } else { this.delFromSelectionProducts(objectId) }
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
.treeselect{
  max-width: 350px;
}
.treeselect .vue-treeselect__multi-value-item-container {
  display: none;
}
</style>
