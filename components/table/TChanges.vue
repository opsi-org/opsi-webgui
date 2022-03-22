<template>
  <div v-if="changesProducts.filter(o => o.user === username).length>0" data-testid="TChanges" class="TChanges">
    <InputIFilterTChanges :filter.sync="filter" />
    <DivDScrollResult>
      <div v-for="changes, k in groupedById" :key="changes.productId">
        <b-button v-b-toggle="k" block class="m-1 text-left collapsebtn" variant="light">
          <small><b>{{ k }}</b></small>
          <b-icon :icon="iconnames.arrowFillDown" class="caret_icon" font-scale="0.8" />
        </b-button>
        <b-collapse :id="k" :visible="filter === '' ? false : true">
          <TableTBVTable
            type="small"
            :noheader="true"
            :hover="true"
            :filter="filter"
            :filterfields="['depotId','clientId']"
            :items="changes"
            :fields="['depotId', 'clientId', 'actionRequest', 'property', 'propertyValue', '_action']"
          >
            <template #cell()="row">
              <small>{{ row.value }}</small>
            </template>
            <template #cell(_action)="row">
              <ButtonBTNDeleteObj :item="row.item" from="products" />
              <b-button size="sm" variant="light" :title="$t('button.save')" @click="save(row.item)">
                <span class="sr-only">{{ $t('button.saveall') }}</span>
                <b-icon :icon="iconnames.save"/>
              </b-button>
            </template>
          </TableTBVTable>
        </b-collapse>
      </div>
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, Watch, namespace, Vue } from 'nuxt-property-decorator'
import { makeToast } from '../../.utils/utils/scomponents'
import { IObjectString2Any } from '../../.utils/types/tgeneral'
import { ChangeObj } from '../../.utils/types/tchanges'
import { Constants } from '../../mixins/uib-mixins'
const changes = namespace('changes')

@Component({ mixins: [Constants] })
export default class TChanges extends Vue {
  iconnames: any
  $axios: any
  $mq: any
  $nuxt: any

  // @Prop({ }) tableitems!: Array<object>
  filter: string = ''
  @changes.Getter public changesProducts!: Array<ChangeObj>
  @changes.Mutation public delFromChangesProducts!: (s: object) => void

  groupedById: Array<object> = []

  get username () {
    return localStorage.getItem('username')
  }

  @Watch('changesProducts', { deep: true }) changesProductsChanged () {
    const tableitems = this.changesProducts.filter(o => o.user === this.username)
    this.groupedById = this.groupArrayOfObjects(tableitems, 'productId')
  }

  beforeMount () {
    const tableitems = this.changesProducts.filter(o => o.user === this.username)
    this.groupedById = this.groupArrayOfObjects(tableitems, 'productId')
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

    // if (this.changesProducts.length === 0) {
    //   this.$bvModal.hide('ProductSaveModal')
    //   this.$nuxt.refresh()
    // }
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
    // if (this.changesProducts.length === 0) {
    //   this.$bvModal.hide('ProductSaveModal')
    //   this.$nuxt.refresh()
    // }
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
.TChanges .collapsebtn{
  width: calc(100% - 5px);
}
</style>
