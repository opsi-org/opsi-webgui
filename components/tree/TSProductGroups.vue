<template>
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

      :icon="iconnames.product"
      :store="{selection:selectionProducts, pushSelection:pushToSelectionProducts, delSelection: delFromSelectionProducts}"
      :fetch-data="fetchData"
      @change="changeSelection"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
const selections = namespace('selections')

@Component({ mixins: [Constants] })
export default class TSProductGroups extends Vue {
  iconnames: any // from mixin
  $axios: any

  @selections.Getter public selectionProducts!: Array<string>;
  @selections.Getter public selectionDepots!: Array<string>;
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void;
  @selections.Mutation public pushToSelectionProducts!: (s: string) => void;
  @selections.Mutation public delFromSelectionProducts!: (s: string) => void;

  async fetchData () {
    const x = Object.values((await this.$axios.$get('api/opsidata/products/groups')).groups)
    // console.log('product groups', JSON.stringify(x))
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
