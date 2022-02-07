<template>
  <div data-testid="VClients">
    <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId" parent-id="tableclients">
      <template #parent>
        <BarBPageHeader>
          <template #left>
            <TreeTSDepots />
            <TreeTSHostGroupLazyLoad />
          </template>
          <template #right>
            <CheckboxCBMultiselection :multiselect.sync="ismultiselect" />
          </template>
        </BarBPageHeader>
        <TableTInfiniteScrollClients :ismultiselect="ismultiselect">
          <template #cell(actionResult_failed)="row">
            <ButtonBTNRowLinkTo
              :label="row.item.version_outdated"
              to="/clients/products"
              sortby="actionResult"
              :ident="row.item.ident"
              :pressed="isRouteActive"
              :click="routeRedirectWith"
            />
          </template>
          <template #cell(rowactions)="row">
            <ButtonBTNRowLinkTo
              title="Products"
              icon="grid"
              to="/clients/products"
              :ident="row.item.ident"
              :pressed="isRouteActive"
              :click="routeRedirectWith"
            />

            <ButtonBTNRowLinkTo
              :title="$t('title.config')"
              icon="gear"
              to="/clients/config"
              :ident="row.item.ident"
              :pressed="isRouteActive"
              :click="routeRedirectWith"
            />

            <ButtonBTNRowLinkTo
              :title="$t('title.log')"
              icon="file-earmark-text"
              to="/clients/log"
              :ident="row.item.ident"
              :pressed="isRouteActive"
              :click="routeRedirectWith"
            />
            <b-badge variant="outline-primary">
              <b-dropdown variant="outline-primary" class="actions_dropdown" size="sm" no-caret>
                <template #button-content>
                  <b-icon icon="three-dots-vertical" />
                </template>
                <ModalMDeleteClient :id="row.item.ident.trim()" />
              </b-dropdown>
            </b-badge>
          </template>
        </TableTInfiniteScrollClients>
      </template>
      <template #child>
        <NuxtChild :id="rowId" :as-child="true" />
      </template>
    </GridGTwoColumnLayout>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, namespace } from 'nuxt-property-decorator'
const selections = namespace('selections')

@Component export default class VClients extends Vue {
  ismultiselect: boolean = false
  rowId: string = ''

  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

  @Watch('ismultiselect', { deep: true }) multiselectChanged () {
    this.setSelectionClients([])
  }

  routeRedirectWith (to: string, rowIdent: string) {
    this.rowId = rowIdent
    this.setClientSelection(rowIdent)
    this.$router.push(to)
  }

  setClientSelection (id: string) {
    this.setSelectionClients([id])
  }

  isRouteActive (to: string, rowIdent: string) {
    return this.$route.path.includes(to) && this.rowId === rowIdent
  }

  get secondColumnOpened () {
    return this.$route.path.includes('config') || this.$route.path.includes('log') || this.$route.path.includes('products')
  }

  routeToChild (id: string) {
    this.routeRedirectWith('/clients/config', id)
  }
}
</script>

<style>
.actions_dropdown .btn-outline-primary{
  border: 0;
}
</style>
