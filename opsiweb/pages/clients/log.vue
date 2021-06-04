<template>
  <div>
    <BarBPageHeader title="Log" closeroute="/depots" />
    <h1>Client LOG</h1>
    <p>Hello {{ id }} !</p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PClientLog extends Vue {
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
