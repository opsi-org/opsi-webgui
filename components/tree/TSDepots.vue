<template>
  <!-- <LazyTreeTSTreeselect
    v-if="depotsList"
    data-testid="TSDepots"
    :searchable="false"
    :options="depotsList"
    :placeholder="'title.depots'"
    icon="hdd-network"
  /> -->
  <!-- v-else-if="getType(obj.type)=='multiselect'" -->
  <div>
    <TreeTSDefault
      id="Depots"
      type="depots"
      data-testid="TSDepots"
      :lazy-load="false"
      :multi="true"
      :text="$t('title.depots')"
      :text-no-result="$t('treeselect.noresult')"
      :validate="() => true"
      :validate-description="''"
      :data="undefined"
      :selection-default="selectionDepots"
      :editable="false"
      :is-list="true"
      :icon="iconnames.depot"
      :fetch-data="fetchDepotData"
      @change="changeSelection"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
const selections = namespace('selections')

@Component({ mixins: [Constants] })
export default class TSDepots extends Vue {
  iconnames: any // from mixin
  $axios: any
  @selections.Getter public selectionDepots!: Array<string>;
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void;

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
