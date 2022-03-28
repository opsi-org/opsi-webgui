<template>
  <div>
    <TreeTSDefaultGroups
      :id="id"
      type="clients"
      data-testid="TSHostGroups"
      :store="{selection:selectionClients, pushSelection:pushToSelectionClients, delSelection: delFromSelectionClients}"
      :text="$t('treeselect.hostGroups')"
      :text-no-result="'NoResult'"
      :validate="() => true"
      :validate-description="''"
      :selection-default="selectionClients"
      :icon="iconnames.client"
      :fetch-data="fetchHostGroupsData"
      :fetch-children="fetchChildren"
      @change="changeSelection"
    />
      <!-- :nested="true"
      :lazy-load="true"
      :multi="true"
      :data="undefined"
      :editable="false"
      :is-list="false" -->
      <!-- value-format="object" -->
  </div>
</template>

<script lang="ts">
import { Component, namespace, Watch, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

const selections = namespace('selections')

@Component({ mixins: [Constants] })
export default class TSHostGroups extends Vue {
  iconnames: any // from mixin
  $axios: any
  $fetch: any
  id: string = 'Clients'
  @selections.Getter public selectionClients!: Array<string>;
  @selections.Getter public selectionDepots!: Array<string>;
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void;
  @selections.Mutation public pushToSelectionClients!: (s: string) => void
  @selections.Mutation public delFromSelectionClients!: (s: string) => void

  clientlistGroups:Array<object> = []

  // @Watch('selectionDefault', { deep: true }) selectionChanged () {
  //   this.setSelectionClients(this.selectionClients)
  // }

  @Watch('selectionDepots', { deep: true }) async selectionDepotChanged () {
    console.log(this.id + ' depot changed')
    await this.$fetch()
  }

  async asyncForEach (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index])
    }
  }

  async fetch () { // clientlist
    console.warn(this.id, 'fetch clientlist')
    this.clientlistGroups = []
    const resultclients = (await this.$axios.$get(`/api/opsidata/depots/clients?selectedDepots=[${this.selectionDepots}]`)).sort()
    resultclients.forEach((c) => { this.clientlistGroups.push({ id: c + ';clientlist', text: c, type: 'ObjectToGroup' }) })
  }

  async fetchHostGroupsData () {
    console.warn(this.id, 'fetch groups')
    console.log(this.id + ' fetch client groups')
    const result = (await this.$axios.$get(`/api/opsidata/hosts/groups?selectedDepots=[${this.selectionDepots}]&selectedClients=[${this.selectionClients}]&parentGroup=root`)).groups
    if (result === undefined) {
      throw new Error(this.id + ' No root host-groups found')
    }
    if (result.clientlist) {
      result.clientlist.children = this.clientlistGroups
    }
    const values = Object.values(result)
    await this.asyncForEach(values, async (c:any) => { if (c.hasAnySelection === true) { await this.setChildren(c) } })
    console.log(this.id + ' fetch client groups end')
    return values
  }

  async fetchChildren (parentNode) {
    if (parentNode.text === 'clientlist' && parentNode.parent == null) {
      if (!parentNode.children) {
        console.log(this.id + ' dont fetch client children - clientlist, but set cause empty children')
        parentNode.children = this.clientlistGroups
      }
    } else {
      console.warn(this.id, 'fetch children', parentNode.id)
      console.log(this.id + ' fetch client children ', parentNode.id)
      const result = (await this.$axios.$get(`/api/opsidata/hosts/groups?selectedDepots=[${this.selectionDepots}]&selectedClients=[${this.selectionClients}]&parentGroup=${parentNode.text}`)).groups.children

      if (result !== null) {
        const values = Object.values(result)
        await this.asyncForEach(values, async (c:any) => { if (c.hasAnySelection === true) { await this.setChildren(c) } })
        // console.log(this.id + ' fetch client children ', parentNode.text, ' end')
        return values
      }
      console.warn(this.id + ' Children null')
    }
  }

  async setChildren (node) {
    const c = await this.fetchChildren(node)
    if (c) {
      console.log(this.id + ' loadchildren result != undefined ', node.id)
      node.children = c
    }
  }

  changeSelection (selection: Event) {
    if (selection === undefined) { return }
    if (!Array.isArray(selection)) { return }

    console.log(this.id + ' changeSelection', JSON.stringify(selection))
    if (selection.length > 0) {
      this.setSelectionClients([...selection])
    } else {
      this.setSelectionClients([])
    }
  }
}
</script>
