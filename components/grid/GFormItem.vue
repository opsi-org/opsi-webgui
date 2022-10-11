<template>
  <b-row data-testid="GFormItem" class="mb-2">
    <b-col sm="5" class="text-sm-right text-break" :class="labelId">
      <slot name="label" />
      {{ label }}
    </b-col>
    <b-col>
      <slot name="value" />
    </b-col>
    <b-col v-if="valueMore">
      <slot name="valueMore" />
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class GFormItem extends Vue {
  @Prop({ }) label?: string
  @Prop({ }) labelId?: string
  @Prop({ }) valueMore?: boolean
}
</script>

<style>
</style>
