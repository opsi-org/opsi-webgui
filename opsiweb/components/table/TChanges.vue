<template>
  <div v-if="tableitems.length>0">
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
          <ButtonBTNDeleteObj :item="row.item" from="products" hide="ProductSaveModal" />
          <b-button size="sm" variant="light" @click="save(row.item)">
            <b-icon icon="check2" />
          </b-button>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, namespace, Vue } from 'nuxt-property-decorator'
import { makeToast } from '@/scripts/utils/scomponents'
import { IObjectString2String, IObjectString2Any } from '~/scripts/types/tgeneral'
import { ChangeObj } from '~/scripts/types/tchanges'
const changes = namespace('changes')

@Component
export default class TChanges extends Vue {
  @Prop({ }) tableitems!: Array<object>
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

  async saveProd (item: ChangeObj) {
    const change = {
      clientIds: [item.clientId],
      productIds: [item.productId],
      actionRequest: item.actionRequest
    }
    const t:any = this
    await this.$axios.$post('/api/opsidata/clients/products', change)
      .then((response) => {
        // eslint-disable-next-line no-console
        console.log(response)
        makeToast(t, 'Action request ' + JSON.stringify(change) + ' saved successfully', this.$t('message.success') as string, 'success')
        this.delFromChangesProducts(item)
      }).catch((error) => {
        makeToast(t, (error as IObjectString2Any).message, this.$t('message.error') as string, 'danger')
      })

    if (this.changesProducts.length === 0) {
      this.$bvModal.hide('ProductSaveModal')
      this.$nuxt.refresh()
    }
  }

  async saveProdProp (item: ChangeObj) {
    const t:any = this
    const propObj: any = {}
    propObj[item.property] = item.propertyValue
    let change = {}
    if (item.clientId !== '') {
      change = {
        clientIds: [item.clientId],
        properties: propObj
      }
    } else {
      change = {
        depotIds: [item.depotId],
        properties: propObj
      }
    }
    await this.$axios.$post(`/api/opsidata/products/${item.productId}/properties`, change)
      .then((response) => {
        // eslint-disable-next-line no-console
        console.log(response)
        makeToast(t, 'Product Property ' + JSON.stringify(change) + ' saved succefully', this.$t('message.success') as string, 'success')
        this.delFromChangesProducts(item)
      }).catch((error) => {
        makeToast(t, (error as IObjectString2Any).message, this.$t('message.error') as string, 'danger', 8000)
      })
    if (this.changesProducts.length === 0) {
      this.$bvModal.hide('ProductSaveModal')
      this.$nuxt.refresh()
    }
  }

  save (rowItem: ChangeObj) {
    const change = rowItem
    if (change.actionRequest) {
      this.saveProd(change)
    } else if (change.property) {
      this.saveProdProp(change)
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
