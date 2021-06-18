<template>
  <div>
    <b-badge v-bind="$props">
      {{ text }}
    </b-badge>
    {{(text == 'mixed')? tooltiptext:''}}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
// import { BSpan } from 'bootstrap-vue'
import { mapValues2Value, mapValues2Objects } from '~/helpers/htable'

@Component
export default class TCSpan extends Vue {
  @Prop({ }) values!: Array<string>
  @Prop({ }) objects!: Array<string>
  @Prop({ }) objectsorigin!: Array<string>

  get text () {
    return mapValues2Value(this.values, this.objects, this.objectsorigin)
  }

  get tooltiptext () {
    return mapValues2Objects(this.values, this.objects, this.objectsorigin, 'not_installed')
  }
}
</script>

<style scoped>
</style>
