<template>
  <b-badge
    v-bind="$props"
  >
    {{ text }}
  </b-badge>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
// import { BSpan } from 'bootstrap-vue'

@Component
export default class TCSpan extends Vue {
  @Prop({ }) values!: Array<string>
  @Prop({ }) objects!: Array<string>
  @Prop({ }) objectsorigin!: Array<string>

  get text () {
    // if (this.rowitem === undefined) {
    //   return '---'
    // }
    if (!this.values || !this.values[0]) {
      return 'none'
    }
    if (this.objects === undefined || this.objects === null) {
      return 'none'
    }
    if (this.objects.length === 0) {
      return 'none'
    }
    if (this.objectsorigin.length === 1 && this.values.length === 1) {
      return this.values[0]
    }
    if (this.objectsorigin.length > 1 && this.values.length === 1) {
      return (this.values[0] === 'none') ? 'none' : 'mixed'
    }
    if (this.objectsorigin.length === this.objects.length) {
      if (this.values.every(val => val === this.values[0])) {
        return this.values[0]
      }
    }
    if (this.values.every(val => val === 'none')) {
      return 'none'
    }

    return 'mixed'
  }
  // get text () {
  //   if (this.values.length === 1) {
  //     return this.values[0]
  //   }
  //   if (this.values.length > 1) {
  //     // TODO: check if all equal
  //     return '>1 (maybe mixed)'
  //     // return this.values[0] || 'mixed'
  //   }
  // }
  // TODO: handle tooltip for different elements in values
}
</script>

<style scoped>
</style>
