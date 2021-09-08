<template>
  <treeselect
    v-model="groupSelection"
    class="treeselect"
    :flat="true"
    :multiple="true"
    :clearable="false"
    :options="options"
    :normalizer="normalizer"
    :load-options="loadOptions"
    :placeholder="$t('treeselect.hostGroups')"
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
import { Component, namespace, Watch, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')
interface Request {
    selectedDepots: string
    parentGroup: string
}
interface ClientRequest {
    selectedDepots: string
}

@Component
export default class TSDelayedLoading extends Vue {
  clientRequest: ClientRequest = { selectedDepots: '' }
  request: Request = { selectedDepots: '', parentGroup: '' }

  options: Array<object> = [
    {
      id: 'clientdirectory',
      text: 'clientdirectory',
      isBranch: true,
      type: 'HostGroup',
      isDisabled: true,
      children: null
    },
    {
      id: 'groups',
      text: 'groups',
      isBranch: true,
      type: 'HostGroup',
      isDisabled: true,
      children: null
    },
    {
      id: 'clientlist',
      text: 'clientlist',
      isBranch: true,
      type: 'HostGroup',
      isDisabled: true,
      children: null
    }
  ]

  groupSelection: Array<any> = []
  groupIdList: Array<string> = []

  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Mutation public pushToSelectionClients!: (s: string) => void
  @selections.Mutation public delFromSelectionClients!: (s: string) => void

  beforeUpdate () {
    this.filterObjectLabel(this.options, 'ObjectToGroup', 'type', 'text', this.groupIdList)
    this.syncStoreToTree()
  }

  @Watch('selectionClients', { deep: true }) selectionClientsChanged () {
    this.syncStoreToTree()
  }

  normalizer (node: any) {
    return {
      id: node.id,
      type: node.type,
      label: node.text.replace(/_+$/, ''),
      children: node.children
    }
  }

  async fetchClientList ({ parentNode }: any) {
    const clientList: Array<object> = []
    this.clientRequest.selectedDepots = JSON.stringify(this.selectionDepots)
    const params = this.clientRequest
    const result = (await this.$axios.$get('/api/opsidata/depots/clients', { params })).result.clients.sort()
    for (const c in result) {
      const client = result[c]
      clientList.push({ id: client + ';clientlist', text: client, type: 'ObjectToGroup' })
    }
    parentNode.children = clientList
  }

  async loadOptions ({ action, parentNode, callback }: any) {
    if (action === 'LOAD_CHILDREN_OPTIONS') {
      this.request.selectedDepots = JSON.stringify(this.selectionDepots)
      this.request.parentGroup = parentNode.text
      if (this.request.parentGroup === 'clientlist') {
        await this.fetchClientList({ parentNode })
      } else {
        const params = this.request
        const result = Object.values((await this.$axios.$get('/api/opsidata/hosts/groups', { params })).result.groups.children)
        if (result !== null) {
          parentNode.children = Object.values(result)
        }
      }
      this.syncStoreToTree()
      callback()
    }
  }

  arrEqual (arr1: Array<string>, arr2: Array<string>) {
    return JSON.stringify(arr1) === JSON.stringify(arr2)
  }

  syncStoreToTree () {
    const storeSelect = this.selectionClients
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
    const storeSel = this.selectionClients
    this.filterObjectLabel([value], 'ObjectToGroup', 'type', 'text', idList)

    for (const i in idList) {
      const objectId = idList[i]
      if (type === 'select') {
        this.pushToSelectionClients(objectId)
      }
      if (type === 'deselect') {
        if (storeSel.includes(objectId)) {
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
.treeselect{
  max-width: 350px;
}
.treeselect .vue-treeselect__multi-value-item-container {
  display: none;
}
</style>
