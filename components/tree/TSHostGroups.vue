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
      icon="laptop"
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
import { Component, namespace, Vue, Watch } from 'nuxt-property-decorator'
const selections = namespace('selections')

@Component
export default class TSHostGroups extends Vue {
  $axios: any

  @selections.Getter public selectionClients!: Array<string>;
  @selections.Getter public selectionDepots!: Array<string>;
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void;
  @selections.Mutation public pushToSelectionClients!: (s: string) => void
  @selections.Mutation public delFromSelectionClients!: (s: string) => void

  @Watch('selectionDefault', { deep: true }) selectionChanged () {
    this.setSelectionClients(this.selectionClients)
  }

  async asyncForEach (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index])
      // await callback(array[index], index, array);
    }
  }

  async fetchHostGroupsData () {
    console.log('fetchHosts')
    const result = (await this.$axios.$get(`/api/opsidata/hosts/groups?selectedDepots=[${this.selectionDepots}]&selectedClients=[${this.selectionClients}]&parentGroup=root`)).groups
    if (result === undefined) {
      throw new Error('No root host-groups found')
    }

    if (result.clientlist) { // todo: just a workaround till groups return highest level for hosts
      const values = Object.values(result)

      await this.asyncForEach(values, async (c:any) => { if (c.hasAnySelection === true) { c.children = await this.fetchChildren(c) } })
      // await values.forEach(async (c:any) => { if (c.hasAnySelection === true) { c.children = await this.fetchChildren(c) } })
      console.log('ROOT', values)
      return values
    }
    return [
      {
        id: 'clientdirectory',
        text: 'clientdirectory',
        isBranch: true,
        type: 'HostGroup',
        isDefaultExpanded: false,
        isDisabled: false,
        children: null
      },
      {
        id: 'groups',
        text: 'groups',
        isBranch: true,
        type: 'HostGroup',
        isDefaultExpanded: false,
        isDisabled: false,
        children: null
      },
      {
        id: 'clientlist',
        text: 'clientlist',
        isBranch: true,
        isDefaultExpanded: false,
        type: 'HostGroup',
        isDisabled: false,
        children: null
      }
    ]
  }

  async fetchChildren (parentNode) {
    if (parentNode.text === 'clientlist') {
      const resultclients = (await this.$axios.$get(`/api/opsidata/depots/clients?selectedDepots=[${this.selectionDepots}]`)).sort()
      const clientlist:Array<object> = []
      resultclients.forEach((c) => { clientlist.push({ id: c + ';clientlist', text: c, type: 'ObjectToGroup' }) })
      console.log('clientlist', clientlist)
      parentNode.children = clientlist
      console.log('dont fetch children', parentNode)
      return clientlist
    } else {
      const result = (await this.$axios.$get(`/api/opsidata/hosts/groups?selectedDepots=[${this.selectionDepots}]&selectedClients=[${this.selectionClients}]&parentGroup=${parentNode.text}`)).groups.children

      if (result !== null) {
        console.log('Children ', result)
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
