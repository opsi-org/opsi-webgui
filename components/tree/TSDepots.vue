<template>
  <TreeTSDefault
    id="Depots"
    type="depots"
    data-testid="TSDepots"
    :lazy-load="false"
    :multi="true"
    :text="$t('title.depots')"
    :text-no-result="$t('treeselect.noresult')"
    :selection-default="selectionDepots"
    :editable="false"
    :is-list="true"
    :icon="iconnames.depot"
    :fetch-data="fetchDepotData"
    @change="changeSelection"
  />
</template>

<script lang="ts">
import { Component, namespace, Vue, Watch } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
import { IObjectString2String } from '~/.utils/types/tgeneral'
const selections = namespace('selections')

@Component({ mixins: [Constants] })
export default class TSDepots extends Vue {
  iconnames: any // from mixin
  $axios: any
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void
  fetchedDataClients2Depots: IObjectString2String = {}

  @Watch('selectionClients', { deep: true }) async clientsChanged () {
    if (this.selectionClients.length <= 0) {
      this.fetchedDataClients2Depots = {}
    } else {
      await this.$axios.$get(`/api/opsidata/clients/depots?selectedClients=[${this.selectionClients}]`)
        .then((response) => {
          this.fetchedDataClients2Depots = response
          console.log('fetchedDataClients2Depots', this.fetchedDataClients2Depots)
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
    console.log('client2depot', selectedClientsOnDepots)
    this.setSelectionClients(Object.keys(selectedClientsOnDepots))
  }

  async fetchDepotData () {
    return await this.$axios.$get('/api/opsidata/depot_ids')
  }

  changeSelection (selection: Event) {
    if (selection === undefined) { return }
    if (!Array.isArray(selection)) { return }

    if (selection.length > 0) {
      this.setSelectionDepots([...selection])
    } else {
      this.setSelectionDepots([])
    }
  }
}
</script>
