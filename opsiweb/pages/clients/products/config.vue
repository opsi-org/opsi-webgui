<template>
  <ViewVProductProperty :id="id" :as-child="asChild" closeroute="/clients/products/" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PClientsProductsColumnConfig extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: false }) asChild!: string
}
</script>

<style>

</style>
