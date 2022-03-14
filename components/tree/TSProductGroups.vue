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
    <TreeTSDefaultGroups
      id="ProductGroups"
      type="products"
      data-testid="TSProductGroups"
      :text="$t('treeselect.prodGroups')"
      :text-no-result="$t('treeselect.noresult')"
      :validate="() => true"
      :validate-description="''"
      :selection-default="selectionProducts"

      icon="grid"
      :store="{selection:selectionProducts, pushSelection:pushToSelectionProducts, delSelection: delFromSelectionProducts}"
      :fetch-data="fetchData"
      @change="changeSelection"
    />
      <!-- :data="undefined"
      :multi="true"
      :editable="false"
      :is-list="false"
      :nested="true"
      value-format="object" -->
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')

@Component
export default class TSProductGroups extends Vue {
  $axios: any

  @selections.Getter public selectionProducts!: Array<string>;
  @selections.Getter public selectionDepots!: Array<string>;
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void;
  @selections.Mutation public pushToSelectionProducts!: (s: string) => void;
  @selections.Mutation public delFromSelectionProducts!: (s: string) => void;

  async fetchData () {
    const x = Object.values((await this.$axios.$get('api/opsidata/products/groups')).groups)
    console.log('product groups', JSON.stringify(x))
    // const x = Object.values((await this.$axios.$get(`/api/opsidata/products/groups?selectedProducts=${this.selectionProducts}`)).groups)
    return x
  }

  changeSelection (selection: Event) {
    if (selection === undefined) { return }
    if (!Array.isArray(selection)) { return }

    if (selection.length > 0) {
      this.setSelectionProducts([...selection])
    } else {
      this.setSelectionProducts([])
    }
  }
}
</script>
