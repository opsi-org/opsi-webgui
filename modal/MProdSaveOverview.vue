<template>
  <div>
    <ButtonBTNOpenModal modal-id="ProductSaveModal" icon="list-check" :disabled="changesProducts.length == 0" />
    <b-modal
      id="ProductSaveModal"
      size="xl"
      title="Overview of Product Changes"
      scrollable
      no-fade
    >
      <TableTChanges title="Netboot Products" :tableitems="changesProducts.filter(o => o.type === 'NetbootProduct')" />
      <TableTChanges title="Localboot Products" :tableitems="changesProducts.filter(o => o.type === 'LocalbootProduct')" />
      <template #modal-footer>
        <ButtonBTNDeleteAll hide="ProductSaveModal" />
        <b-button size="sm" variant="primary" @click="saveAll()">
          <b-icon icon="check2" /> Save All
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { makeToast } from '@/scripts/utils/scomponents'
import { IObjectString2String } from '~/scripts/types/tgeneral'
import { ChangeObj } from '~/scripts/types/tchanges'
const changes = namespace('changes')

@Component
export default class MProdSaveOverview extends Vue {
  @changes.Getter public changesProducts!: Array<ChangeObj>
  @changes.Mutation public delFromChangesProducts!: (s: object) => void

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

  saveAll () {
    for (const p in this.changesProducts) {
      this.save(this.changesProducts[p])
    }
  }
}
</script>

<style>
.modal-dialog {
  left: 0% !important;
  margin-top: 50px;
}
</style>
