<template>
  <div data-testid="TTHelpExpert">
    <b-tooltip :target="target" variant="light">
      <!-- stacked -->
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
      // stacked:
      // { [this.$t('settingsPage.mode') as string]: '', [this.$t('userinfo.normal') as string]: this.$t('userinfo.normal_desc'), [this.$t('userinfo.expert') as string]: this.$t('userinfo.expert_desc') }

      // { [this.$t('settingsPage.mode') as string]: this.$t('userinfo.normal'), ' ': this.$t('userinfo.normal_desc') },
      // { [this.$t('settingsPage.mode') as string]: this.$t('userinfo.expert'), ' ': this.$t('userinfo.expert_desc') }

      { '  ': this.$t('userinfo.basic'), ' ': this.$t('userinfo.basic_desc') },
      { '  ': this.$t('userinfo.expert'), ' ': this.$t('userinfo.expert_desc') }
    ]
  }
}
</script>
<style>
#TTHelpExpertDetails {
  max-width: 500px !important;
}
</style>
