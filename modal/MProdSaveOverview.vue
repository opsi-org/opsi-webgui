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
    >
      <b-table :items="changesProducts" :fields="['productId', 'clientId', 'productType', 'actionRequest', '_action']">
        <template #cell(_action)="row">
          <b-button-group>
            <ButtonBTNDeleteObj :item="row.item" from="products" hide="ProductSaveModal" />
            <b-button @click="save(row.item)">
              <b-icon icon="check2" />
            </b-button>
          </b-button-group>
        </template>
      </b-table>
      <b-row>
        <b-col>
          <ButtonBTNDeleteAll hide="ProductSaveModal" />
        </b-col>
        <b-col cols="auto">
          <b-button>
            <b-icon icon="check2" /> Save All
          </b-button>
        </b-col>
      </b-row>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const changes = namespace('changes')
@Component
export default class MProdSaveOverview extends Vue {
  saveResult: any
  @changes.Getter public changesProducts!: Array<object>
  @changes.Mutation public delFromChangesProducts!: (s: object) => void

  async save (item: object) {
    const body = item
    this.saveResult = await this.$axios.$patch('/api/opsidata/clients/products', JSON.stringify(body))
    if (this.saveResult.error === {}) {
      this.delFromChangesProducts(item)
    }
    if (this.changesProducts.length === 0) {
      this.$bvModal.hide('ProductSaveModal')
    }
  }
}
</script>

<style>
</style>
