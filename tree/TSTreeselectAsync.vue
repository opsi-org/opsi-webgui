<template>
  <b-input-group>
    <treeselect
      v-model="groupSelection"
      class="treeselect"
      value-format="object"
      :flat="true"
      :placeholder="type === 'hostgroup' ? 'Host Group' : 'Product Group'"
      :multiple="true"
      :clearable="false"
      :options="Object.values(options)"
      :max-height="300"
      :load-options="localLoadOptions"
      :branch-nodes-first="true"
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
  </b-input-group>
</template>

<script lang="ts">
import { Component, namespace, Watch, Prop, Vue } from 'nuxt-property-decorator'
import { IGroup, IGroups } from '~/types/tbackendmethods'
import { arrEqual } from '~/helpers/equal'
const selections = namespace('selections')

@Component
export default class TSTreeselect extends Vue {
  @Prop({ }) loadOptions!: Function
  @Prop({ }) options!: IGroups
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
    this.filterObjectLabel(this.options, this.groupIdList, 'isBranch', 'label', false)
    this.syncStoreToTree()
  }

  async localLoadOptions (data:any) {
    await this.loadOptions(data)
    this.syncStoreToTree()
  }

  syncStoreToTree () {
    const storeData = this.selectionClients
    let treeData = this.groupSelection.filter(item => item.isBranch)
    treeData = [...new Set(treeData)]
    if (!arrEqual(storeData, treeData)) {
      const elementsInTree: Array<string> = []
      this.filterObject(this.options, elementsInTree, 'label', ...storeData)
      this.groupSelection = elementsInTree
    }
  }

  filterObject (elements: any, resultArray:Array<any>, key: string, ...matchingValues: any[]) {
    for (const elementKey in elements) {
      const element = elements[elementKey]
      if (matchingValues.includes(element[key])) {
        resultArray.push(element)
      } else if (element.children !== null) {
        this.filterObject(element.children, resultArray, key, ...matchingValues)
      }
    }
  }

  filterObjectLabel (elements: any, resultArray:Array<string>, compareKey: string, mapKey:string, ...matchingValues: any[]) {
    for (const elementKey in elements) {
      const element = elements[elementKey]
      if (matchingValues.includes(element[compareKey])) {
        resultArray.push(element[mapKey])
      } else if (element.children != null) {
        this.filterObjectLabel(element.children, resultArray, compareKey, mapKey, ...matchingValues)
      }
    }
  }

  groupChange (value: object, type: string) {
    const objListGroup: Array<IGroup> = []
    let idListClients: Array<string> = []
    this.filterObjectLabel([value], idListClients, 'isBranch', 'label', false)
    this.filterObject([value], objListGroup, 'isBranch', 'label', true)
    const storeData = this.selectionClients
    for (const i in objListGroup) {
      const obj = objListGroup[i]
      if (obj == null || obj.children == null) { continue }
      for (const j in obj.children) {
        if (!obj.children[j].isBranch) {
          if (!idListClients.includes(obj.children[j].label)) {
            idListClients.push(obj.children[j].label)
          }
        }
      }
    }
    idListClients = [...new Set(idListClients)]
    // TODO: Select clients in group, if group is selected (visual)
    for (const i in idListClients) {
      const objectId = idListClients[i]
      if (type === 'select') {
        this.pushToSelectionClients(objectId)
      }
      if (type === 'deselect') {
        if (storeData.includes(objectId)) {
          this.delFromSelectionClients(objectId)
        }
      }
    }
    this.syncStoreToTree()
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
