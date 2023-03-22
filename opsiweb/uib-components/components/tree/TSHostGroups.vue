<template>
  <TreeTSDefaultGroups
    :id="id"
    type="clients"
    data-testid="TSHostGroups"
    :store="{selection:selectionClients, pushSelection:pushToSelectionClients, delSelection: delFromSelectionClients}"
    :text="$t('treeselect.clientGroups')"
    :text-no-result="$t('treeselect.noresult')"
    :validate="() => true"
    :validate-description="''"
    :selection-default="selectionClients"
    :icon="iconnames.client"
    :fetch-data="fetchHostGroupsData"
    :fetch-children="fetchChildren"
    :disable-root-objects="true"
    @change="changeSelection"
  />
</template>

<script lang="ts">
import { Component, namespace, Watch, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
import { IObjectString2String } from '../../.utils/types/tgeneral'

const selections = namespace('selections')

@Component({ mixins: [Constants] })
export default class TSHostGroups extends Vue {
  iconnames: any // from mixin
  $axios: any
  $fetch: any
  id: string = 'HostGroups'
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void
  @selections.Mutation public pushToSelectionClients!: (s: string) => void
  @selections.Mutation public delFromSelectionClients!: (s: string) => void

  clientlistGroups:Array<object> = []
  fetchedDataClients2Depots: IObjectString2String = {}

  @Watch('selectionDepots', { deep: true }) async selectionDepotChanged () {
    await this.$fetch()
  }

  @Watch('selectionClients', { deep: true }) async clientsChanged () {
    if (this.selectionClients.length <= 0) {
      this.fetchedDataClients2Depots = {}
    } else {
      await this.$axios.$get(`/api/opsidata/clientsdepots?selectedClients=[${this.selectionClients}]`)
        .then((response) => {
          this.fetchedDataClients2Depots = response
        }).catch((error) => {
          this.fetchedDataClients2Depots = {}
          throw new Error(error)
        })
    }
  }

  @Watch('selectionDepots', { deep: true }) depotsChanged () {
    const selectedClientsOnDepots = Object.fromEntries(Object.entries(this.fetchedDataClients2Depots).filter(
      ([_, value]) => this.selectionDepots.includes(value)
    ))
    this.setSelectionClients(Object.keys(selectedClientsOnDepots))
  }

  async asyncForEach (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index])
    }
  }

  async fetch () { // clientlist
    this.clientlistGroups = []
    const resultclients = (await this.$axios.$get(`/api/opsidata/depots/clients?selectedDepots=[${this.selectionDepots}]`)).sort()
    resultclients.forEach((c) => { this.clientlistGroups.push({ id: c + ';clientlist', text: c, type: 'ObjectToGroup', isDisabled: false }) })
  }

  async fetchHostGroupsData () {
    const result = (await this.$axios.$get(`/api/opsidata/hosts/groups?selectedDepots=[${this.selectionDepots}]&selectedClients=[${this.selectionClients}]&parentGroup=root`)).groups
    if (result === undefined) {
      throw new Error(this.id + ' No root host-groups found')
    }
    if (result.clientlist) {
      result.clientlist.children = this.clientlistGroups
    }
    const values = Object.values(result)
    await this.asyncForEach(values, async (c:any) => { await this.loadChilds(c) })
    return values
  }

  async fetchChildren (parentNode) {
    if (parentNode.text === 'clientlist' && parentNode.parent == null) {
      if (!parentNode.children) {
        parentNode.children = this.clientlistGroups
      }
    } else {
      const result = (await this.$axios.$get(`/api/opsidata/hosts/groups?selectedDepots=[${this.selectionDepots}]&selectedClients=[${this.selectionClients}]&parentGroup=${parentNode.text}`)).groups.children
      if (result !== null) {
        const values = Object.values(result)
        await this.asyncForEach(values, async (c:any) => { await this.loadChilds(c) })
        return values
      }
    }
  }

  async loadChilds (node) {
    // if (node.hasAnySelection === true && !['groups', 'clientdirectory', 'clientlist'].includes(node.text)) {
    if (node.hasAnySelection === true) {
      const c = await this.fetchChildren(node)
      if (c) { node.children = c }
    }
  }

  changeSelection (selection: Event) {
    if (selection === undefined) { return }
    if (!Array.isArray(selection)) { return }
    if (selection.length > 0) {
      this.setSelectionClients([...selection])
    } else {
      this.setSelectionClients([])
    }
  }
}
</script>