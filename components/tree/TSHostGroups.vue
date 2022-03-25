<template>
  <div>
    <TreeTSDefaultGroups
      id="Clients"
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

  @selections.Getter public selectionClients!: Array<string>;
  @selections.Getter public selectionDepots!: Array<string>;
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void;
  @selections.Mutation public pushToSelectionClients!: (s: string) => void
  @selections.Mutation public delFromSelectionClients!: (s: string) => void

  clientlistGroups:Array<object> = []

  @Watch('selectionDefault', { deep: true }) selectionChanged () {
    this.setSelectionClients(this.selectionClients)
  }

  @Watch('selectionDepots', { deep: true }) async selectionDepotChanged () {
    await this.$fetch()
  }

  async asyncForEach (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index])
    }
  }

  async fetch () {
    this.clientlistGroups = []
    const resultclients = (await this.$axios.$get(`/api/opsidata/depots/clients?selectedDepots=[${this.selectionDepots}]`)).sort()
    resultclients.forEach((c) => { this.clientlistGroups.push({ id: c + ';clientlist', text: c, type: 'ObjectToGroup' }) })
  }

  async fetchHostGroupsData () {
    const result = (await this.$axios.$get(`/api/opsidata/hosts/groups?selectedDepots=[${this.selectionDepots}]&selectedClients=[${this.selectionClients}]&parentGroup=root`)).groups
    if (result === undefined) {
      throw new Error('No root host-groups found')
    }

    result.clientlist.children = this.clientlistGroups

    const values = Object.values(result)
    await this.asyncForEach(values, async (c:any) => { if (c.hasAnySelection === true) { c.children = await this.fetchChildren(c) } })
    return values
  }

  async fetchChildren (parentNode) {
    if (parentNode.text !== 'clientlist') {
      const result = (await this.$axios.$get(`/api/opsidata/hosts/groups?selectedDepots=[${this.selectionDepots}]&selectedClients=[${this.selectionClients}]&parentGroup=${parentNode.text}`)).groups.children

      if (result !== null) {
        const values = Object.values(result)
        await this.asyncForEach(values, async (c:any) => { if (c.hasAnySelection === true) { c.children = await this.fetchChildren(c) } })
        return values
      }
      console.warn('Children null')
    }
  }

  changeSelection (selection: Event) {
    if (selection === undefined) { return }
    if (!Array.isArray(selection)) { return }

    console.log('changeSelection', JSON.stringify(selection))
    if (selection.length > 0) {
      this.setSelectionClients([...selection])
    } else {
      this.setSelectionClients([])
    }
  }
}
</script>
