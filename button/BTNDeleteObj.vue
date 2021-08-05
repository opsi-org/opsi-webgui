<template>
  <b-button @click="deleteObj()">
    <b-icon icon="trash" />
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class BTNDeleteObj extends Vue {
  @Prop({ }) item!: object
  @Prop({ }) hide!: string
  @Prop({ }) deleteFrom!: Array<object>
  deleteObj () {
    this.deleteFrom.splice(this.deleteFrom.indexOf(this.item), 1)
    if (this.deleteFrom.length === 0) {
      this.$bvModal.hide(this.hide)
    }
  }
}
</script>

<style>

</style>
