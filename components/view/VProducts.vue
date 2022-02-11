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
            <TreeTSHostGroupLazyLoad v-if="!child" />
            <TreeTSProductGroup />
          </template>
          <template #right>
            <CheckboxCBMultiselection :multiselect.sync="ismultiselect" />
            <ModalMProdSaveOverview
              v-if="expert && changesProducts"
              :changelist="changesProducts.filter((o) => o.user === username)"
            />
          </template>
        </BarBPageHeader>
        <TableTProductsNetboot
          :multiselect="ismultiselect"
          :sortby="sortby"
          :rowident="rowId"
          :route-redirect-with="routeRedirectWith"
          :child="child"
        />
        <TableTProductsLocalboot
          :multiselect="ismultiselect"
          :sortby="sortby"
          :rowident="rowId"
          :route-redirect-with="routeRedirectWith"
          :child="child"
        />
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
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void;
  @settings.Getter public expert!: boolean;
  @changes.Getter public changesProducts!: Array<ChangeObj>;

  rowId: string = '';
  isLoading: boolean = true;
  ismultiselect: boolean = false;

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
