<template>
  <div v-if="tableitems.length>0">
    <!-- <BarBPageHeader
      navbartype="collapse"
      variant="light"
      :collapsed="visible"
      :aria-controls="title+'-collapsechanges'"
      :aria-expanded="visible"
      :title="title"
      @click.native="visible = !visible"
    />
    <b-collapse :id="title+'-collapsechanges'" v-model="visible" accordion="table-accordion"> -->
    <InputIFilterTChanges :filter.sync="filter" />
    <div v-for="changes, k in groupedById" :key="changes.productId">
      <small><b>{{ k }}</b></small>
      <b-table
        size="sm"
        :filter="filter"
        :filter-included-fields="['depotId','clientId']"
        hover
        borderless
        sticky-header
        fixed
        class="changes_table"
        thead-class="table-header-none"
        :items="changes"
        :fields="['depotId', 'clientId', 'actionRequest', 'property', 'propertyValue', '_action']"
      >
        <template #cell()="row">
          <small>{{ row.value }}</small>
        </template>
        <template #cell(_action)="row">
          <!-- <b-button-group> -->
          <ButtonBTNDeleteObj :item="row.item" from="products" hide="ProductSaveModal" />
          <b-button size="sm" variant="light" @click="save(row.item)">
            <b-icon icon="check2" />
          </b-button>
          <!-- </b-button-group> -->
        </template>
      </b-table>
    </div>
    <!-- </b-collapse> -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, namespace, Vue } from 'nuxt-property-decorator'
import { makeToast } from '@/scripts/utils/scomponents'
import { IObjectString2String } from '~/scripts/types/tgeneral'
import { ChangeObj } from '~/scripts/types/tchanges'
const changes = namespace('changes')

@Component
export default class TChanges extends Vue {
  @Prop({ }) tableitems!: Array<object>
  @Prop({ }) title!: string
  visible: boolean = true
  filter: string = ''

  @changes.Getter public changesProducts!: Array<ChangeObj>
  @changes.Mutation public delFromChangesProducts!: (s: object) => void

  groupedById: Array<object> = []

  @Watch('tableitems', { deep: true }) tableitemsChanged () { this.groupedById = this.groupArrayOfObjects(this.tableitems, 'productId') }

  beforeMount () {
    this.groupedById = this.groupArrayOfObjects(this.tableitems, 'productId')
  }

  groupArrayOfObjects (list: Array<any>, key:any) {
    return list.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x)
      return rv
    }, {})
  }

  async save (item: ChangeObj) {
    const change = {
      clientIds: [item.clientId],
      productIds: [item.productId],
      actionRequest: item.actionRequest
    }

    const responseError: IObjectString2String = (await this.$axios.$patch(
      '/api/opsidata/clients/products',
      { data: change }
    )).error
    if (Object.keys(responseError).length > 0) {
      let txt = 'Errors for: <br />'
      for (const k in responseError) {
        txt += `${k}: ${responseError[k]} <br />`
      }
      makeToast(this, txt, this.$t('message.warning') as string, 'warning')
    } else {
      this.delFromChangesProducts(item)
    }
    if (this.changesProducts.length === 0) {
      this.$bvModal.hide('ProductSaveModal')
      this.$nuxt.refresh()
    }
  }
}
</script>

<style>
.changes_table{
  max-height: 160px !important;
}
.table-header-none{
  display: none;
}
</style>
