<template>
  <div>
    <BarBPageHeader :title="'Products - ' + id" closeroute="/clients/" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PClientsProductsColumn extends Vue {
  @Prop({ }) id!: string
}
</script>
