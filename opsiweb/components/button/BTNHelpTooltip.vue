<template>
  <div>
    <b-button :id="id" size="sm" pill variant="transparent" class="border-primary">
      <b-icon-question />
    </b-button>
    <TooltipTTTooltip variant="info" :target="id" :tooltip="tooltip" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class BTNHelp extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) tooltip!: string
}
</script>
