<template>
  <div>
    <b> {{ title }}: </b>
    <b-table
      v-if="tableitems.length>0"
      size="sm"
      hover
      borderless
      sticky-header
      fixed
      thead-class="table-header-none"
      :items="tableitems"
      :fields="['productId', 'clientId', 'actionRequest', '_action']"
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
    <div v-else>
      --
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, namespace, Vue } from 'nuxt-property-decorator'
import { makeToast } from '@/mixins/toast'
import { IObjectString2String } from '~/types/tsettings'
const changes = namespace('changes')

@Component
export default class TChanges extends Vue {
  @Prop({ }) tableitems!: Array<object>
  @Prop({ }) title!: string

  @changes.Getter public changesProducts!: Array<object>
  @changes.Mutation public delFromChangesProducts!: (s: object) => void

  async save (item: any) {
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
      makeToast(this, txt, this.$t('message.warning'), 'warning')
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
