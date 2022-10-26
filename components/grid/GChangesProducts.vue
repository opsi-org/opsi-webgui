<template>
  <div data-testid="GChangesProducts">
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
      <DivDComponentGroup class="float-right">
        <ButtonBTNClearChanges hide="trackChangesModal" from="products" />
        <b-button variant="success" :title="$t('button.saveall')" @click="saveAll()">
          <b-icon :icon="iconnames.save" />
          <span class="saveall">{{ $t('button.saveall') }}</span>
        </b-button>
      </DivDComponentGroup>
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
import { SaveProductProperties } from '../../mixins/save'
const auth = namespace('auth')
const changes = namespace('changes')

@Component({ mixins: [Constants, SaveProductProperties] })
export default class GChangesProducts extends Vue {
  iconnames: any
  $axios: any
  $mq: any
  $nuxt: any
  $t:any
  saveProdProperties:any
  filter: string = ''
  groupedById: Array<any> = []
  @auth.Getter public username!: string
  @changes.Getter public changesProducts!: Array<ChangeObj>
  @changes.Mutation public delFromChangesProducts!: (s: object) => void

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
    await this.$axios.$post('/api/opsidata/clients/products', change)
      .then(() => {
        const ref = (this.$refs.changesAlert as any)
        ref.alert(this.$t('message.success.trackChanges.save'), 'success')
        this.$nuxt.refresh()
        this.delFromChangesProducts(item)
      }).catch((error) => {
        const ref = (this.$refs.changesAlert as any)
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.title'), 'danger', detailedError)
      })
  }

  async save (rowItem: ChangeObj) {
    const change = rowItem
    if (change.actionRequest) {
      this.saveProd(change)
    } else if (change.property) {
      const propObj: any = {}
      propObj[change.property] = change.propertyValue
      let propertychanges = {}
      if (change.clientId !== '') {
        propertychanges = {
          clientIds: [change.clientId],
          properties: propObj
        }
      } else {
        propertychanges = {
          depotIds: [change.depotId],
          properties: propObj
        }
      }
      await this.saveProdProperties(change.productId, propertychanges, change)
    }
  }

  async saveAll () {
    const changelist = this.changesProducts.filter(o => o.user === this.username)
    for (const p in changelist) {
      const change = changelist[p]
      await this.save(change)
    }
  }
}
</script>

<style>
.TChanges .collapsebtn{
  width: calc(100% - 5px);
}
</style>
