<template>
  <div>
    <AlertAAlert ref="changesAlert" />
    <div v-if="changesProducts.filter(o => o.user === username).length>0" data-testid="TChanges" class="TChanges">
      <InputIFilterTChanges :placeholder="$t('table.filterBy.DepotsClients')" :filter.sync="filter" />
      <DivDScrollResult>
        <div v-for="changes, k in groupedById" :key="changes.productId">
          <b-button v-b-toggle="k" block class="text-left collapsebtn border-0" variant="outline-primary">
            <b>{{ k }}</b>
            <b-icon :icon="iconnames.arrowFillDown" class="caret_icon" font-scale="0.8" />
          </b-button>
          <b-collapse :id="k" :visible="filter === '' ? false : true">
            <!-- !item.depotId.includes(filter) &&  -->
            <span v-for="item, index in changes" :key="index" :class="{ 'd-none': item.clientId && !item.clientId.includes(filter) || item.depotId && !item.depotId.includes(filter)}">
              <GridGFormItem value-more="true">
                <template #label>
                  {{ item.depotId || item.clientId }}
                </template>
                <template #value>
                  {{ item.actionRequest || ($t('{ ') + item.property + $t(' : ') + item.propertyValue + $t(' }') ) }}
                </template>
                <template #valueMore>
                  <ButtonBTNDeleteObj :item="item" from="products" />
                  <b-button class="border-0" variant="outline-primary" :title="$t('button.save')" @click="save(item)">
                    <span class="sr-only">{{ $t('button.save') }}</span>
                    <b-icon :icon="iconnames.save" />
                  </b-button>
                </template>
              </GridGFormItem>
            </span>
          </b-collapse>
        </div>
      </DivDScrollResult>
    </div>
    <div v-else>
      {{ $t('empty') }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, namespace, Vue } from 'nuxt-property-decorator'
import { ChangeObj } from '../../.utils/types/tchanges'
import { Constants } from '../../mixins/uib-mixins'
const auth = namespace('auth')
const changes = namespace('changes')

@Component({ mixins: [Constants] })
export default class TChanges extends Vue {
  iconnames: any
  $axios: any
  $mq: any
  $nuxt: any
  $t:any

  filter: string = ''
  @auth.Getter public username!: string
  @changes.Getter public changesProducts!: Array<ChangeObj>
  @changes.Mutation public delFromChangesProducts!: (s: object) => void

  groupedById: Array<any> = []

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
    // const t:any = this
    await this.$axios.$post('/api/opsidata/clients/products', change)
      .then((response) => {
        // eslint-disable-next-line no-console
        console.log(response)
        const ref = (this.$refs.changesAlert as any)
        ref.alert(this.$t('message.success.trackChanges.save'), 'success')
        this.$nuxt.refresh()
        // makeToast(t, 'Action request ' + JSON.stringify(change) + ' saved successfully', this.$t('message.success.title') as string, 'success')
        this.delFromChangesProducts(item)
      }).catch((error) => {
        const ref = (this.$refs.changesAlert as any)
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.title'), 'danger', detailedError)
        // makeToast(t, (error as IObjectString2Any).message, this.$t('message.error.title') as string, 'danger')
      })
  }

  async saveProdProp (item: ChangeObj) {
    // const t:any = this
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
        const ref = (this.$refs.changesAlert as any)
        ref.alert(this.$t('message.success.trackChanges.save'), 'success')
        this.$nuxt.refresh()
        // makeToast(t, 'Product Property ' + JSON.stringify(change) + ' saved succefully', this.$t('message.success.title') as string, 'success')
        this.delFromChangesProducts(item)
      }).catch((error) => {
        const ref = (this.$refs.changesAlert as any)
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.title'), 'danger', detailedError)
        // makeToast(t, (error as IObjectString2Any).message, this.$t('message.error.title') as string, 'danger', 8000)
      })
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
