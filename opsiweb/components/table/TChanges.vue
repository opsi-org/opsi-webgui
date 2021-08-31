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
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class TChanges extends Vue {
  @Prop({ }) tableitems!: Array<object>
  @Prop({ }) title!: string
}
</script>

<style>
.table-header-none{
  display: none;
}
</style>
