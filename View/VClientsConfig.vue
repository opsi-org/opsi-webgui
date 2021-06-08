<template>
  <div>
    <BarBPageHeader v-if="asChild" title="Config" closeroute="/clients/" />
    <p>Hello from config page !</p>
    <p v-if="id">Hello {{ id }}!</p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class VClientConfig extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: false }) 'asChild'!: string
  mounted () {
    // if (this.id === undefined) {
    //   this.$router.push({ path: '/clients/index' })
    // } else if (this.id === '') {
    //   console.log('empty id')
    // }
  }
}
</script>

<style>

</style>
