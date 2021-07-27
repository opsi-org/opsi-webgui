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
  @Prop({ }) deleteFrom!: Array<object>
  deleteObj () {
    this.deleteFrom.splice(this.deleteFrom.indexOf(this.item), 1)
  }
}
</script>

<style>

</style>
