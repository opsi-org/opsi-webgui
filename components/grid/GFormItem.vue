<template>
  <b-row data-testid="GFormItem" class="mb-3">
    <b-col sm="5" class="text-sm-right" :class="labelId">
      <div class="text-break">
        <slot name="label" />
        {{ label }}
      </div>
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
