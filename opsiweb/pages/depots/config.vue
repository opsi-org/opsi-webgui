<template>
  <div>
    <BarBPageHeader title="Config" closeroute="/depots" />
    <h1>Depot CONFIG</h1>
    <p>Hello {{ id }} !</p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PDepotConfig extends Vue {
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
