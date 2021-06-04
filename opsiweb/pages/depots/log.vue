<template>
  <div>
    <BarBPageHeader title="Log" closeroute="/depots" />
    <h1>Depot LOG</h1>
    <p>Hello {{ id }} !</p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PDepotLog extends Vue {
  @Prop({ }) id!: string
  mounted () {
    if (this.id === '') {
      this.$router.push({ path: '/depots/' })
    }
  }
}
</script>

<style>

</style>
