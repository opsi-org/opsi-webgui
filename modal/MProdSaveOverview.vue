<template>
  <div>
    <ButtonBTNOpenModal modal-id="ProductSaveModal" icon="list-check" :disabled="changesProducts.length == 0" />
    <b-modal
      id="ProductSaveModal"
      size="xl"
      title="Overview of Product Changes"
      scrollable
      centered
      hide-footer
      no-fade
    >
      <TableTChanges title="Netboot Products" :tableitems="changesProducts.filter(o => o.type === 'NetbootProduct')" />
      <TableTChanges title="Localboot Products" :tableitems="changesProducts.filter(o => o.type === 'LocalbootProduct')" />
      <b-row>
        <b-col>
          <ButtonBTNDeleteAll hide="ProductSaveModal" />
        </b-col>
        <b-col cols="auto">
          <b-button @click="saveAll()">
            <b-icon icon="check2" /> Save All
          </b-button>
        </b-col>
      </b-row>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { IObjectString2String } from '~/types/tsettings'
const changes = namespace('changes')
@Component
export default class MProdSaveOverview extends Vue {
  saveResult: any
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
      this.$bvToast.toast(txt, {
        title: 'Warnings:',
        autoHideDelay: 5000,
        appendToast: false
      })
    } else {
      this.delFromChangesProducts(item)
    }
    if (this.changesProducts.length === 0) {
      this.$bvModal.hide('ProductSaveModal')
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
}
</style>
