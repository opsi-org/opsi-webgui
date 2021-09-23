<template>
  <div>
    <ViewVProductProperty :id="id" :as-child="asChild" closeroute="/products/" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PProductsConfig extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: false }) asChild!: string
}
</script>

<style>

</style>
