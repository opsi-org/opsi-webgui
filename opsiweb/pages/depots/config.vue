<template>
  <div>
    <ViewVConfig :id="id" :as-child="asChild" closeroute="/depots/" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PDepotConfig extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: false }) asChild!: string
}
</script>

<style>

</style>
