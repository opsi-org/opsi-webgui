<template>
  <div data-testid="VProducts">
    <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId">
      <template #parent>
        <BarBPageHeader
          v-if="child"
          :title="'Products'"
          closeroute="/clients/"
        />
        <BarBPageHeader>
          <template #left>
            <TreeTSDepots v-if="!child" />
            <TreeTSHostGroups v-if="!child" />
            <TreeTSProductGroups />
          </template>
          <template #right>
            <CheckboxCBMultiselection :multiselect.sync="ismultiselect" />
            <b-button v-if="changesProducts.filter((o) => o.user === username).length != 0" class="changeslink border" variant="link" to="/changes/">
              Track Changes
            </b-button>
            <!-- <ModalMProdSaveOverview
              v-if="expert && changesProducts"
              :changelist="changesProducts.filter((o) => o.user === username)"
            /> -->
          </template>
        </BarBPageHeader>
        <b-tabs class="products_horizontaltabs">
          <template #tabs-end>
            <!-- <TreeTSDepots v-if="!child" />
            <TreeTSHostGroups v-if="!child" />
            <TreeTSProductGroups /> -->
          </template>
          <b-tab disabled>
            <template #title>
              <small> <b> {{ selectionProducts.length }}/{{ parseInt(localboot) + parseInt(netboot) }} </b> </small>
            </template>
          <!-- </b-tab>
          <b-tab> -->
            <!-- <template #title>
              <small> <b> {{ selectionProducts.length }}/{{ parseInt(localboot) + parseInt(netboot) }} </b> </small>
            </template> -->
          </b-tab>
          <b-tab :title="$t('title.localboot') + ' (' + localboot + ')'" active>
            <TableTProductsLocalboot
              :totallocalboot.sync="localboot"
              :multiselect="ismultiselect"
              :sortby="sortby"
              :rowident="rowId"
              :route-redirect-with="routeRedirectWith"
              :child="child"
            />
          </b-tab>
          <b-tab :title="$t('title.netboot') + ' (' + netboot + ')'">
            <TableTProductsNetboot
              :totalnetboot.sync="netboot"
              :multiselect="ismultiselect"
              :sortby="sortby"
              :rowident="rowId"
              :route-redirect-with="routeRedirectWith"
              :child="child"
            />
          </b-tab>
        </b-tabs>
      </template>
      <template #child>
        <NuxtChild :id="rowId" :as-child="true" />
      </template>
    </GridGTwoColumnLayout>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, namespace } from 'nuxt-property-decorator'
import { ChangeObj } from '../../.utils/types/tchanges'
const selections = namespace('selections')
const settings = namespace('settings')
const changes = namespace('changes')
@Component
export default class VProducts extends Vue {
  @Prop() child!: boolean;
  @Prop({}) id!: string;
  @Prop({}) sortby!: string;
  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionProducts!: Array<string>
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void
  @settings.Getter public expert!: boolean;
  @changes.Getter public changesProducts!: Array<ChangeObj>;

  rowId: string = '';
  isLoading: boolean = true;
  ismultiselect: boolean = false;
  localboot: string = ''
  netboot: string = ''

  @Watch('ismultiselect', { deep: true }) multiselectChanged () {
    this.setSelectionProducts([])
  }

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

<style>
.products_horizontaltabs .nav-item{
  min-width: min-content;
}
.changeslink.btn-link {
  font-weight: bold;
  color: green;
}
</style>
