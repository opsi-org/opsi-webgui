<template>
  <div data-testid="VProducts">
    <BarBPageHeader>
      <template #left>
        <TreeTSProductGroup />
      </template>
    </BarBPageHeader>
    <TableTProductsNetboot :rowident="id" />
    <TableTProductsLocalboot :rowident="id" />
    <ButtonBTNClearSelection store="products" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class VClientsProducts extends Vue {
  @Prop({ }) id!: string
}
</script>
