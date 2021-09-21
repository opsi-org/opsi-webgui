<template>
  <div v-if="tableitems.length>0">
    <h4> {{ title }}: </h4>
    <div v-for="changes, k in groupedById" :key="changes.productId">
      <b>{{ k }}</b>
      <b-table
        size="sm"
        hover
        borderless
        sticky-header
        fixed
        class="changes_table"
        thead-class="table-header-none"
        :items="changes"
        :fields="['clientId', 'actionRequest', '_action']"
      >
        <template #cell(_action)="row">
          <b-button-group>
            <ButtonBTNDeleteObj :item="row.item" from="products" hide="ProductSaveModal" />
            <b-button variant="light" @click="save(row.item)">
              <b-icon icon="check2" />
            </b-button>
          </b-button-group>
        </template>
      </b-table>
    </div>
  </div>
  <div v-else>
    --
  </div>
</template>

<script lang="ts">
import { Component, Prop, namespace, Vue } from 'nuxt-property-decorator'
import { makeToast } from '@/mixins/toast'
import { IObjectString2String } from '~/types/tsettings'
import { ChangeObj } from '~/types/tchanges'
const changes = namespace('changes')

@Component
export default class TChanges extends Vue {
  @Prop({ }) tableitems!: Array<object>
  @Prop({ }) title!: string

  @changes.Getter public changesProducts!: Array<ChangeObj>
  @changes.Mutation public delFromChangesProducts!: (s: object) => void

  groupedById: Array<object> = []

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
.table-header-none{
  display: none;
}
</style>
