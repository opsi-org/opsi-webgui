<template>
  <div>
    <BarBPageHeader :title="'Products -'" :subtitle="id" closeroute="/clients/" />
    <ViewVProducts :child="true" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PClientsProductsColumn extends Vue {
  @Prop({ }) id!: string
}
</script>
