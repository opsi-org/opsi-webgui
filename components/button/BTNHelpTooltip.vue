<template>
  <div>
    <b-button
      :id="id"
      data-testid="BTNHelpTooltip"
      variant="transparent"
      size="sm"
    >
      <b-icon :icon="iconnames.help" />
    </b-button>
    <TooltipTTTooltip variant="info" :target="id" :triggers="triggers" :tooltip="tooltip" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class BTNHelpTooltip extends Vue {
  iconnames: any
  @Prop({ }) id!: string
  @Prop({ }) tooltip!: string
  @Prop({ default: 'hover' }) triggers!: string
}
</script>
