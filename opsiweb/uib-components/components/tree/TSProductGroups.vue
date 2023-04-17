<template>
  <TreeTSDefaultGroups
    id="ProductGroups"
    type="products"
    data-testid="TSProductGroups"
    :text="$t('treeselect.prodGroups')"
    :text-no-result="$t('treeselect.noresult')"
    :selection-default="selectionProducts"
    :icon-prop="icon.product"
    :fetch-data="fetchData"
    :disable-root-objects="false"
    :store="{selection:selectionProducts, pushSelection:pushToSelectionProducts, delSelection: delFromSelectionProducts}"
    @change="changeSelection"
  />
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
const selections = namespace('selections')

@Component({ mixins: [Icons] })
export default class TSProductGroups extends Vue {
  icon: any // from mixin
  $axios: any

  @selections.Getter public selectionProducts!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void
  @selections.Mutation public pushToSelectionProducts!: (s: string) => void
  @selections.Mutation public delFromSelectionProducts!: (s: string) => void
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
