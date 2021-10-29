<template>
  <div class="form-inline" style="margin-right:30px">
    <b-icon-laptop variant="primary" font-scale="2" />
    <b-badge class="selection_badge" variant="light" size="sm">
      {{ selectionClients.length }}
    </b-badge>
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
import { filterObjectLabel, filterObject } from '@/scripts/utils/sfilters'
import { Group } from '~/scripts/types/tbackendmethods'
import { arrayEqual } from '~/scripts/utils/scompares'
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
    filterObjectLabel(this.options, 'ObjectToGroup', 'type', 'text', this.groupIdList)
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
    const result = (await this.$axios.$get('/api/opsidata/depots/clients', { params })).sort()
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
        const result = Object.values((await this.$axios.$get('/api/opsidata/hosts/groups', { params })).groups.children)
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
    if (arrayEqual(storeSelect, treeData)) {
      // eslint-disable-next-line no-useless-return
      return
    }
    const elementsInTree: Array<string> = []
    for (const index in storeSelect) {
      if (this.groupIdList.includes(storeSelect[index])) {
        filterObject(
          this.options, storeSelect[index],
          'text', elementsInTree)
      }
    }
    this.groupSelection = elementsInTree
  }

  groupChange (value: object, type: string) {
    const idList : Array<string> = []
    const storeSel = this.selectionClients
    filterObjectLabel([value], 'ObjectToGroup', 'type', 'text', idList)

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
.treeselect .vue-treeselect__multi-value-item {
  display: none;
}
.treeselect .vue-treeselect__placeholder {
    color: gray;
}
.treeselect .vue-treeselect-helper-hide {
  display: inline;
}
.treeselect .vue-treeselect__option--disabled .vue-treeselect__label-container{
  cursor: pointer;
  color: black;
}
.treeselect .vue-treeselect__option-arrow{
  color: black
}
.form-inline {
  flex-flow: nowrap;
}
.selection_badge{
  margin-top: 20px;
}
</style>
