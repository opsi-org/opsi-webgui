<template>
  <b-row data-testid="GFormItem" :class="formclass" class="p-0">
    <b-col :sm="variant === 'longlabel' ? 5 : 3" class="text-break pl-4 text-small text-sm-left" :class="labelclass">
      <slot name="label" />
      {{ label }}
    </b-col>
    <b-col class="text-sm-left text-small">
      <slot name="value" />
      {{ value }}
    </b-col>
    <b-col v-if="valueMore" class="text-sm-left text-small">
      <slot name="valueMore" />
      {{ valuedetails }}
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class GFormItem extends Vue {
  @Prop({ }) label?: string
  @Prop({ }) labelclass?: string
  @Prop({ }) value?: string
  @Prop({ }) valueMore?: boolean
  @Prop({ }) valuedetails?: string
  @Prop({ default: 'shortlabel' }) variant?: string
  @Prop({ default: 'mb-2 container' }) formclass?: any
}
</script>
