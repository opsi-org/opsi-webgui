<template>
  <div data-testid="MProdSaveOverview">
    <ButtonBTNOpenModal modal-id="ProductSaveModal" icon="list-check" :disabled="changelist.length == 0" />
    <b-modal
      id="ProductSaveModal"
      size="xl"
      title="Overview of Product Changes"
      scrollable
      no-fade
    >
      <TableTChanges :tableitems="changelist" />
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
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { makeToast } from '@/.utils/utils/scomponents'
import { IObjectString2Any } from '@/.utils/types/tgeneral'
import { ChangeObj } from '@/.utils/types/tchanges'
const auth = namespace('auth')
const changes = namespace('changes')

@Component
export default class MProdSaveOverview extends Vue {
  @Prop({ }) changelist!: Array<any>
  @auth.Mutation public setSession!: () => void
  @changes.Mutation public delFromChangesProducts!: (s: object) => void

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
        this.setSession()
      }).catch((error) => {
        makeToast(t, (error as IObjectString2Any).message, this.$t('message.error') as string, 'danger')
      })
    if (this.changelist.length === 0) {
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
        this.setSession()
      }).catch((error) => {
        makeToast(t, (error as IObjectString2Any).message, this.$t('message.error') as string, 'danger', 8000)
      })
    if (this.changelist.length === 0) {
      this.$bvModal.hide('ProductSaveModal')
      this.$nuxt.refresh()
    }
  }

  saveAll () {
    for (const p in this.changelist) {
      const change = this.changelist[p]
      if (change.actionRequest) {
        this.saveProd(change)
      } else if (change.property) {
        this.saveProdProp(change)
      }
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
