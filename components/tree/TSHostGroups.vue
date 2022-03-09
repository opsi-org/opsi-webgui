<template>
  <div>
    <TreeTSDefault
      id="Clients"
      type="clients"
      data-testid="TSHostGroups"
      :nested="true"
      :store="{selection:selectionClients, pushSelection:pushToSelectionClients, delSelection: delFromSelectionClients}"
      :lazy-load="true"
      :multi="true"
      :text="$t('treeselect.hostGroups')"
      :text-no-result="'NoResult'"
      :validate="() => true"
      :validate-description="''"
      :data="undefined"
      :selection-default="selectionClients"
      :editable="false"
      :is-list="false"
      icon="laptop"
      value-format="object"
      :fetch-data="fetchHostGroupsData"
      :fetch-children="fetchChildren"
      @change="changeSelection"
    />
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
    const result = (await this.$axios.$get(`/api/opsidata/depots/clients?selectedDepots=${this.selectionDepots}`)).sort()
    const clientlist:Array<object> = []
    result.forEach((c) => { clientlist.push({ id: c + ';clientlist', text: c, type: 'ObjectToGroup' }) })
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
      const result = (await this.$axios.$get(`/api/opsidata/hosts/groups?selectedDepots=${this.selectionDepots}&parentGroup=${parentNode.text}`)).groups.children
      if (result !== null) {
        return Object.values(result)
      }
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
