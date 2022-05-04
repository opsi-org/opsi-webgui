<template>
  <div data-testid="TTHelpExpert">
    <b-tooltip :target="target">
      <b-table
        id="TTHelpExpertDetails"
        borderless
        responsive="md"
        :items="tooltiptext"
      />
    </b-tooltip>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class TTHelpExpert extends Vue {
  @Prop({ }) target!: string

  get tooltiptext () {
    return [
      { '  ': this.$t('label.on'), ' ': this.$t('description.quicksave.on') },
      { '  ': this.$t('label.off'), ' ': this.$t('description.quicksave.off') }
    ]
  }
}
</script>
<style>
#TTHelpExpertDetails {
  max-width: 500px !important;
}
</style>
