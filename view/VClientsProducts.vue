<template>
  <div data-testid="VProducts">
    <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId">
      <template #parent>
        <BarBPageHeader>
          <template #left>
            <TreeTSProductGroup />
          </template>
          <template #right>
            <CheckboxCBMultiselection :multiselect.sync="ismultiselect" />
            <ModalMProdSaveOverview v-if="expert && changesProducts" :changelist="changesProducts.filter(o => o.user === username)" />
          </template>
        </BarBPageHeader>
        <TableTProductsNetboot :multiselect="ismultiselect" :rowident="rowId" :route-redirect-with="routeRedirectWith" :child="true" />
        <TableTProductsLocalboot :multiselect="ismultiselect" :rowident="rowId" :route-redirect-with="routeRedirectWith" :child="true" />
        <ButtonBTNClearSelection store="products" />
      </template>
      <template #child>
        <NuxtChild :id="rowId" :as-child="true" />
      </template>
    </GridGTwoColumnLayout>
  </div>
</template>

<script lang="ts">
import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { ChangeObj } from '~/scripts/types/tchanges'
const settings = namespace('settings')
const changes = namespace('changes')
@Component
export default class VProducts extends Vue {
  @settings.Getter public expert!: boolean
  @changes.Getter public changesProducts!: Array<ChangeObj>

  rowId: string = ''
  isLoading: boolean = true
  ismultiselect: boolean = false

  routeRedirectWith (to: string, rowIdent: string) {
    this.rowId = rowIdent
    this.$router.push(to)
  }

  get secondColumnOpened () {
    return this.$route.path.includes('config') || this.$route.path.includes('log')
  }

  get username () {
    return localStorage.getItem('username')
  }
}
</script>
