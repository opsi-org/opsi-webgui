<template>
  <div>
    <b-badge :id="`TCBadgeCompares_${type}_hover_${rowid}`">
      {{ text }}
    </b-badge>
    <!-- {{(text == 'mixed')? tooltiptext:''}} -->
    <TooltipTTProductCell
      :target="`TCBadgeCompares_${type}_hover_${rowid}`"
      :details="tooltiptext"
      :type="type"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
// import { BSpan } from 'bootstrap-vue'
import { mapValues2Value, mapValues2Objects } from '~/helpers/hmappings'

@Component
export default class TCSpan extends Vue {
  @Prop({ }) rowid!: string
  @Prop({ }) type!: string
  @Prop({ }) values!: Array<string>
  @Prop({ }) objects!: Array<string>
  @Prop({ }) objectsorigin!: Array<string>

  get text () {
    // console.debug('values', this.values)
    // console.debug('objects', this.objects)
    // console.debug('objectsorigin', this.objectsorigin)
    return mapValues2Value(this.values, this.objects, this.objectsorigin)
  }

  get tooltiptext () {
    return mapValues2Objects(this.values, this.objects, this.objectsorigin, 'not_installed')
  }
}
</script>

<style scoped>
</style>
