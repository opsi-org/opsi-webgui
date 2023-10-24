<template>
  <div>
    <b-button
      :id="id"
      data-testid="BTNHelpTooltip"
      variant="light"
      size="sm"
    >
      <IconIIcon :icon="icon.help" />
    </b-button>
    <TooltipTTTooltip variant="info" :target="id" :triggers="triggers" :tooltip="tooltip" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class BTNHelpTooltip extends Vue {
  icon: any
  @Prop({ }) id!: string
  @Prop({ }) tooltip!: string
  @Prop({ default: 'hover' }) triggers!: string
}
</script>
