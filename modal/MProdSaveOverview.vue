<template>
  <div>
    <ButtonBTNOpenModal modal-id="ProductSaveModal" icon="list-check" :disabled="productChanges.length == 0" />
    <b-modal
      id="ProductSaveModal"
      size="xl"
      title="Overview of Product Changes"
      scrollable
      centered
      hide-footer
    >
      <b-table :items="productChanges" :fields="['productId', 'clientId', 'productType', 'actionRequest', '_action']">
        <template #cell(_action)="row">
          <b-button-group>
            <ButtonBTNDeleteObj :item="row.item" :delete-from="productChanges" hide="ProductSaveModal" />
            <b-button>
              <b-icon icon="check2" />
            </b-button>
          </b-button-group>
        </template>
      </b-table>
      <b-row>
        <b-col>
          <ButtonBTNDeleteAll :items="productChanges" hide="ProductSaveModal" />
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
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class MProdSaveOverview extends Vue {
  @Prop({ }) productChanges!:any
}
</script>

<style>
</style>
