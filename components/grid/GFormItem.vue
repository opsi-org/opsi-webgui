<template>
  <b-row data-testid="GFormItem" class="mb-2">
    <b-col :sm="variant === 'longlabel' ? 5 : 3" class="text-break" :class="classgrid">
      <span class="labelcolor">
        <slot name="label" />
        {{ label }}
      </span>
    </b-col>
    <b-col class="text-sm-left">
      <slot name="value" />
    </b-col>
    <b-col v-if="valueMore" class="text-sm-left">
      <slot name="valueMore" />
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class GFormItem extends Vue {
  @Prop({ }) label?: string
  @Prop({ default: 'shortlabel' }) variant!: string
  @Prop({ default: 'text-sm-right' }) classgrid?: string
  @Prop({ }) valueMore?: boolean
}
</script>
