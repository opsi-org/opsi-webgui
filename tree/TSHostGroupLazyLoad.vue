<template>
  <div class="form-inline" style="margin-right:30px">
    <b-icon-laptop variant="primary" font-scale="2" />
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
          <b-icon v-if="node.isBranch" icon="diagram2" />
          <b-icon v-else icon="laptop" />
          <small> {{ node.label }} </small>
        </div>
      </div>
    </treeselect>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Watch, Vue } from 'nuxt-property-decorator'
import { methods } from '@/mixins/methods'
import { Group } from '~/types/tbackendmethods'
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

  options: Array<Group> = [
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
    methods.filterObjectLabel(this.options, 'ObjectToGroup', 'type', 'text', this.groupIdList)
    this.syncStoreToTree()
  }

  @Watch('selectionClients', { deep: true }) selectionClientsChanged () {
    this.syncStoreToTree()
  }

  normalizer (node: Group) {
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

  syncStoreToTree () {
    const storeSelect = this.selectionClients
    let treeData = this.groupSelection.filter(item => item.type === 'ObjectToGroup')
    treeData = [...new Set(treeData)]
    if (methods.arrEqual(storeSelect, treeData)) {
      // eslint-disable-next-line no-useless-return
      return
    }
    const elementsInTree: Array<string> = []
    for (const index in storeSelect) {
      if (this.groupIdList.includes(storeSelect[index])) {
        methods.filterObject(
          this.options, storeSelect[index],
          'text', elementsInTree)
      }
    }
    this.groupSelection = elementsInTree
  }

  groupChange (value: object, type: string) {
    const idList : Array<string> = []
    const storeSel = this.selectionClients
    methods.filterObjectLabel([value], 'ObjectToGroup', 'type', 'text', idList)

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

  groupSelect (selection: object) {
    this.groupChange(selection, 'select')
  }

  groupDeselect (deselection: object) {
    this.groupChange(deselection, 'deselect')
  }
}
</script>

<style>
.treeselect{
  max-width: 300px;
}
.treeselect .vue-treeselect__multi-value-item-container {
  display: none;
}
</style>
