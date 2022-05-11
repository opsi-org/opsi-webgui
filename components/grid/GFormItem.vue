<template>
  <b-row data-testid="GFormItem" class="mb-4">
    <b-col cols="2" class="text-sm-right">
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
  @Prop({ }) valueMore?: boolean
}
</script>

<style>
</style>
