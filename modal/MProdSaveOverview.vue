<template>
  <div>
    <b-button
      v-b-modal.ProductSaveModal
      :disabled="productChanges.length == 0"
      :variant="productChanges.length != 0 ? 'success' : 'light'"
    >
      <b-icon icon="list-check" :variant="productChanges.length != 0 ? 'light' : 'dark'" />
    </b-button>
    <b-modal
      id="ProductSaveModal"
      size="xl"
      title="Overview of Product Changes"
      scrollable
      centered
      hide-footer
    >
      <b-table :items="productChanges" :fields="['productId', 'selectedDepots', 'selectedClients', 'actionRequest', 'clientVersions', 'depotVersions', 'depot_version_diff', '_action']">
        <template #cell(_action)="row">
          <b-button-group>
            <b-button @click="deleteItem(row.item)">
              <b-icon icon="trash" />
            </b-button>
            <b-button>
              <b-icon icon="check2" />
            </b-button>
          </b-button-group>
        </template>
      </b-table>
      <!-- {{ productChanges }} -->

      <b-row>
        <b-col>
          <b-button @click="deleteAll()">
            <b-icon icon="trash" /> Delete All
          </b-button>
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

  deleteItem (row: object) {
    this.productChanges.splice(this.productChanges.indexOf(row), 1)
  }

  deleteAll () {
    this.productChanges.splice(0, this.productChanges.length)
    this.$bvModal.hide('ProductSaveModal')
  }
}
</script>

<style>
</style>
