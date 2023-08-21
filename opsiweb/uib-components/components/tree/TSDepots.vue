<template>
  <LazyTreeTSDefault
    v-if="fetchDepotData"
    v-bind="$props"
    id="Depots"
    :text="$t('title.depots')"
    :class="classes"
    :type="type"
    :always-open="open"
    data-testid="TSDepots"
    :lazy-load="true"
    :multi="true"
    :text-no-result="$t('treeselect.noresult')"
    :selection-default="selectionDepots"
    :editable="false"
    :is-list="true"
    :fetch-data="fetchDepotData"
    @change="changeSelection"
  />
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
import { Depot, Client } from '../../mixins/get'
import { IObjectString2String } from '../../.utils/types/tgeneral'
const selections = namespace('selections')

@Component({ mixins: [Icons, Depot, Client] })
export default class TSDepots extends Vue {
  icon: any // from mixin
  $axios: any
  getDepotIdList:any
  getClientToDepot:any
  @Prop({ default: false }) open!: boolean
  @Prop({ }) classes!: any
  @Prop({ default: 'treeselect_short' }) type!: string
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void
  fetchedDataClients2Depots: IObjectString2String = {}

  @Watch('selectionClients', { deep: true }) async clientsChanged () {
    if (this.selectionClients.length <= 0) {
      this.fetchedDataClients2Depots = {}
    } else {
      await this.getClientToDepot(this.selectionClients)
    }
  }

  @Watch('selectionDepots', { deep: true }) depotsChanged () {
    const selectedClientsOnDepots = Object.fromEntries(Object.entries(this.fetchedDataClients2Depots).filter(
      ([_, value]) => this.selectionDepots.includes(value)
    ))
    this.setSelectionClients(Object.keys(selectedClientsOnDepots))
  }

  async fetchDepotData () {
    return await this.getDepotIdList()
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
