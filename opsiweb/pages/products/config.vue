<template>
  <ViewVProductProperty :id="id" :as-child="asChild" closeroute="/products/" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PProductsConfigColumn extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: false }) asChild!: string
}
</script>
