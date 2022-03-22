<template>
  <div data-testid="VProducts">
    <GridGTwoColumnLayout :showchild="secondColumnOpened && rowId">
      <template #parent>
        <BarBCollapsePageHeader
          :title="$t('title.products')"
          :row-id="rowId"
          :collapsed="!secondColumnOpened"
          :collapseable="true"
          :enable-depots="!child"
          :enable-clients="!child"
          :enable-products="true"
          :enable-show-products="false"
          :enable-show-changes="changesProducts.filter((o) => o.user === username).length != 0"
          :multiselect-toggler.sync="ismultiselect"
          :redirect-on-close-to="(child)? '/clients/': undefined"
          :redirect="routeRedirectWith"
        />
        <b-tabs class="products_horizontaltabs">
          <b-tab disabled>
            <template #title>
              <small> <b> {{ selectionProducts.length }}/{{ parseInt(localboot) + parseInt(netboot) }} </b> </small>
            </template>
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
import Cookie from 'js-cookie'
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

  created () {
    if (Cookie.get('multiselect_products')) {
      this.ismultiselect = JSON.parse(Cookie.get('multiselect_products') as unknown as any)
    }
  }

  @Watch('ismultiselect', { deep: true }) multiselectChanged () {
    Cookie.set('multiselect_products', JSON.stringify(this.ismultiselect), { expires: 365 })
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
