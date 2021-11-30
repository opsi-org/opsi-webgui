<template>
  <div data-testid="TTTooltip">
    <b-tooltip
      :custom-class="classes"
      :triggers="triggers"
      :target="target"
      :variant="variant"
    >
      <slot name="tooltip">
        {{ (tooltip || "im here for help :)") }}
      </slot>
    </b-tooltip>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class TTTooltip extends Vue {
   @Prop({ default: 'info' }) variant!: string
   @Prop({ default: 'hover' }) triggers!: string
   @Prop({ }) tooltip!: string
   @Prop({ }) target!: string
   @Prop({ }) classes!: string
}
</script>
<style>

</style>
