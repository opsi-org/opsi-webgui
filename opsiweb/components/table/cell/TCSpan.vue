<template>
  <b-span
    v-bind="$props"
  >
    {{ text }}
  </b-span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
// import { BSpan } from 'bootstrap-vue'

@Component
export default class TCSpan extends Vue {
  @Prop({ }) list2text!: Array<string>

  get text () {
    if (this.list2text.length === 1) {
      return this.list2text[0]
    }
    if (this.list2text.length > 1) {
      // TODO: check if all equal
      return '>1 (maybe mixed)'
      // return this.list2text[0] || 'mixed'
    }
  }
  // TODO: handle tooltip for different elements in list2text
}
</script>

<style scoped>
</style>
