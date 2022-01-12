<template>
  <div>
    <!-- <BarBPageHeader :title="'Products -'" :subtitle="id" closeroute="/clients/" /> -->
    <ViewVProducts :id="id" :sortby="sortby" :child="true" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PClientsProductsColumn extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) sortby!: string
}
</script>
