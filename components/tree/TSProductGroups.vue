<template>
  <TreeTSDefaultGroups
    id="ProductGroups"
    type="products"
    data-testid="TSProductGroups"
    :text="$t('treeselect.prodGroups')"
    :text-no-result="$t('treeselect.noresult')"
    :selection-default="selectionProducts"
    :icon="iconnames.product"
    :fetch-data="fetchData"
    :disable-root-objects="false"
    :store="{selection:selectionProducts, pushSelection:pushToSelectionProducts, delSelection: delFromSelectionProducts}"
    @change="changeSelection"
  />
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
  groups: Array<any>|undefined = undefined
  async fetchData () {
    // return Object.values((await this.$axios.$get(`/api/opsidata/products/groups?selectionProducts=${this.selectionProducts}`)).groups)
    if (this.groups === undefined) { // dont refetch
      this.groups = Object.values((await this.$axios.$get(`/api/opsidata/products/groups?selectedProducts=${this.selectionProducts}`)).groups)
    }
    return this.groups
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
