<template>
  <div data-testid="GChangesProducts">
    <AlertAAlert ref="changesProductsAlert" />
    <div v-if="changesProducts.filter(o => o.user === username).length>0" data-testid="TChanges" class="TChanges">
      <b-row>
        <b-col>
          <InputIFilterTChanges :placeholder="$t('table.filterBy.DepotsClients')" :filter.sync="filter" />
        </b-col>
        <b-col cols="auto">
          <ButtonBTNClearChanges hide="trackChangesModal" from="products" />
          <b-button variant="success" :title="$t('button.saveall')" size="sm" @click="saveAll()">
            <b-icon :icon="icon.check" />
            <span class="saveall">{{ $t('button.saveall') }}</span>
          </b-button>
        </b-col>
      </b-row>

      <DivDScrollResult>
        <div v-for="changes, k in groupedById" :key="changes.productId">
          <b-button v-b-toggle="k" block class="text-left collapsebtn border-0" size="sm" variant="outline-primary">
            <b>{{ k }}</b>
            <b-icon :icon="icon.arrowFillDown" class="caret_icon" font-scale="0.8" />
          </b-button>
          <b-collapse :id="k" :visible="filter === '' ? false : true">
            <span v-for="item, index in changes" :key="index" :class="{ 'd-none': item.clientId && !item.clientId.includes(filter) || item.depotId && !item.depotId.includes(filter)}">
              <GridGFormItem
                value-more="true"
                :label="item.depotId || item.clientId"
                :value="item.actionRequest || '{ '+item.property + ' : ' + item.propertyValue + ' }'"
              >
                <template #valueMore>
                  <ButtonBTNDeleteObj :item="item" from="products" />
                  <b-button class="border-0" variant="outline-primary" size="sm" :title="$t('button.save')" @click="save(item, false)">
                    <span class="sr-only">{{ $t('button.save') }}</span>
                    <b-icon :icon="icon.check" />
                  </b-button>
                </template>
              </GridGFormItem>
            </span>
          </b-collapse>
        </div>
      </DivDScrollResult>
    </div>
    <div v-else>
      {{ $t('keep-english.empty') }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, namespace, Vue } from 'nuxt-property-decorator'
import { ChangeObj } from '../../.utils/types/tchanges'
import { Icons } from '../../mixins/icons'
import { SaveProductActionRequest, SaveProductProperties } from '../../mixins/save'
const auth = namespace('auth')
const changes = namespace('changes')
const errors = namespace('errors')

@Component({ mixins: [Icons, SaveProductActionRequest, SaveProductProperties] })
export default class GChangesProducts extends Vue {
  icon: any
  $axios: any
  $mq: any
  $nuxt: any
  $t:any
  saveProdProperties:any
  saveProdActionRequest:any
  filter: string = ''
  groupedById: Array<any> = []
  @auth.Getter public username!: string
  @errors.Getter public errorsProducts!: Array<any>
  @errors.Mutation public clearErrorsProducts!: () => void
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
      rv[x[key]] = rv[x[key]] || []
      rv[x[key]].push(x)
      return rv
    }, {})
  }

  async save (rowItem: ChangeObj, saveAll:boolean) {
    const change = rowItem
    let showalert: any = true
    if (saveAll) {
      showalert = false
    }
    if (change.actionRequest) {
      const data = {
        clientIds: [change.clientId],
        productIds: [change.productId],
        actionRequest: change.actionRequest
      }
      await this.saveProdActionRequest(data, change, showalert)
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
      await this.saveProdProperties(change.productId, propertychanges, change, showalert)
    }
  }

  async saveAll () {
    const ref = (this.$refs.changesProductsAlert as any)
    const changelist = this.changesProducts.filter(o => o.user === this.username)
    const saveAll = true
    for (const p in changelist) {
      const change = changelist[p]
      await this.save(change, saveAll)
    }
    if (this.errorsProducts.length !== 0) {
      ref.alert(this.$t('message.error.title'), 'danger', this.errorsProducts)
      this.clearErrorsProducts()
    }
  }
}
</script>

<style>
.TChanges .collapsebtn{
  width: calc(100% - 5px);
}
</style>
