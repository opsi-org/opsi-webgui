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
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')

@Component
export default class TSHostGroups extends Vue {
  $axios: any

  @selections.Getter public selectionClients!: Array<string>;
  @selections.Getter public selectionDepots!: Array<string>;
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void;
  @selections.Mutation public pushToSelectionClients!: (s: string) => void
  @selections.Mutation public delFromSelectionClients!: (s: string) => void

  async fetchHostGroupsData () {
    const resultclients = (await this.$axios.$get(`/api/opsidata/depots/clients?selectedDepots=${this.selectionDepots}`)).sort()
    const clientlist:Array<object> = []
    resultclients.forEach((c) => { clientlist.push({ id: c + ';clientlist', text: c, type: 'ObjectToGroup' }) })

    const result = (await this.$axios.$get(`/api/opsidata/hosts/groups?selectedDepots=${this.selectionDepots}&selectionClients=${this.selectionClients}&parentGroup=root`)).groups.children
    if (result.clientlist) { // todo: just a workaround till groups return highest level for hosts
      result.clientlist.children = clientlist
      return Object.values(result)
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
        children: clientlist
      }
    ]
  }

  async fetchChildren (parentNode) {
    const request = { selectedDepots: '', parentGroup: '' }
    request.selectedDepots = JSON.stringify(this.selectionDepots)
    request.parentGroup = parentNode.text

    if (parentNode.text === 'clientlist') {
      //
    } else {
      const result = (await this.$axios.$get(`/api/opsidata/hosts/groups?selectedDepots=${this.selectionDepots}&selectedClients=${this.selectionClients}&parentGroup=${parentNode.text}`)).groups.children
      if (result !== null) {
        return Object.values(result)
      }
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
