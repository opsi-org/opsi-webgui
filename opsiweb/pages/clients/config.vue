<template>
  <div>
    <BarBPageHeader title="Config" closeroute="/clients"/>
    <h1>Client CONFIG</h1>
    <p>Hello {{ id }} !</p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PClientConfig extends Vue {
  @Prop({ }) id!: string
  mounted () {
    if (this.id === '') {
      this.$router.push({ path: '/clients/' })
    }
  }
}
</script>

<style>

</style>
