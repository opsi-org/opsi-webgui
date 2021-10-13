<template>
  <div>
    <b-button
      :id="id"
      data-testid="BTNHelpTooltip"
      class="border-primary"
      variant="transparent"
      size="sm"
      pill
    >
      <b-icon-question />
    </b-button>
    <TooltipTTTooltip variant="info" :target="id" :triggers="triggers" :tooltip="tooltip" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class BTNHelpTooltip extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) tooltip!: string
  @Prop({ default: 'hover' }) triggers!: string
}
</script>
