<template>
  <div v-if="light !== false">
    <img
      v-if="short !== false"
      data-testid="IconIUibLogo"
      src="../../assets/images/UIB_1704_2023_UIB_Schriftzug_quer.png"
      :alt="$t('alt.uiblogo')"
      :class="{opsilogo_light: light, [classes]: true}"
    >
    <img
      v-else
      data-testid="IconIUibLogo"
      src="../../assets/images/UIB_1704_2023_UIB_Logo_quer.png"
      :alt="$t('alt.uiblogo')"
      :class="{opsilogo_light: light, [classes]: true}"
    >
  </div>
  <div v-else>
    <img
      v-if="short !== false"
      data-testid="IconIUibLogo"
      src="../../assets/images/UIB_1704_2023_UIB_Schriftzug_quer_neg.png"
      :alt="$t('alt.uiblogo')"
      :class="{opsilogo_light: light, [classes]: true}"
    >
    <img
      v-else
      data-testid="IconIUibLogo"
      src="../../assets/images/UIB_1704_2023_UIB_Logo_quer_neg.png"
      :alt="$t('alt.uiblogo')"
      :class="{opsilogo_light: light, [classes]: true}"
    >
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class IOpsiLogo extends Vue {
  @Prop({ default: true }) short!: boolean
  @Prop({ default: false }) light!: boolean
  @Prop({ default: '' }) classes!: string
}
</script>

<style>
/* .opsilogo_light {
  filter: saturate(0) brightness(5) !important;
} */
</style>
