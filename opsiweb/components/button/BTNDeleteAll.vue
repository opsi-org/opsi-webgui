<template>
  <b-button @click="deleteAll()">
    <b-icon icon="trash" /> Delete All
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class BTNDeleteAll extends Vue {
  @Prop({ }) items!: Array<object>
  @Prop({ }) hide!: string
  deleteAll () {
    this.items.splice(0, this.items.length)
    if (this.hide) { this.$bvModal.hide(this.hide) }
  }
}
</script>

<style>

</style>
