<template>
  <b-row data-testid="GFormItem" :class="classprop" class="p-0">
    <b-col :sm="variant === 'longlabel' ? 5 : 3" class="text-break pl-4 text-small" :class="classgrid">
      <slot name="label" />
      {{ label }}
    </b-col>
    <b-col class="text-sm-left text-small">
      <slot name="value" />
    </b-col>
    <b-col v-if="valueMore" class="text-sm-left text-small">
      <slot name="valueMore" />
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class GFormItem extends Vue {
  @Prop({ }) label?: string
  @Prop({ default: 'mb-2 container' }) classprop?: any
  @Prop({ default: 'shortlabel' }) variant!: string
  @Prop({ default: 'text-sm-left' }) classgrid?: string
  @Prop({ }) valueMore?: boolean
}
</script>
