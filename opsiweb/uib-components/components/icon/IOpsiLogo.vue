<template>
  <div v-if="short !== false">
    <img
      v-if="light !== false"
      data-testid="IconIOpsiLogo"
      src="../../assets/images/UIB_1704_2023_OPSI_Logo_Bildmarke_ohne_Text_quer.png"
      :alt="translatedLabel"
      class="opsilogo_short_light"
      :height="height"
      :class="{opsilogo_white: white !== false, [classes]: true}"
    >
    <img
      v-else
      data-testid="IconIOpsiLogo"
      src="../../assets/images/UIB_1704_2023_OPSI_Logo_Bildmarke_ohne_Text_quer_neg.png"
      :alt="translatedLabel"
      class="opsilogo_short_dark"
      :height="height"
      :class="{opsilogo_white: white !== false, [classes]: true}"
    >
    {{ light }}
  </div>
  <div v-else>
    <img
      v-if="light !== false"
      data-testid="IconIOpsiLogo"
      src="../../assets/images/UIB_1704_2023_OPSI_Logo_Bildmarke_quer.png"
      :alt="translatedLabel"
      class="opsilogo_long_light"
      :height="height"
      :class="{opsilogo_white: white !== false, [classes]: true}"
    >
    <img
      v-else
      data-testid="IconIOpsiLogo"
      src="../../assets/images/UIB_1704_2023_OPSI_Logo_Bildmarke_quer_neg.png"
      :alt="translatedLabel"
      class="opsilogo_long_dark"
      :height="height"
      :class="{opsilogo_white: white !== false, [classes]: true}"
    >
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class IOpsiLogo extends Vue {
  @Prop({ default: true }) short!: boolean
  @Prop({ default: false }) light!: boolean
  @Prop({ default: false }) white!: boolean
  @Prop({ default: '' }) classes!: string
  @Prop({ default: '' }) height!: string
  $t: any
  translatedLabel: string = ''

  mounted () {
    this.translatedLabel = this.$t('button.reload.app')
  }
}
</script>

<style>
.opsilogo_white {
  filter: saturate(0) brightness(5) !important;
}
/* .theme-dark .opsilogo_short_light,
.theme-dark .opsilogo_long_light {
  display: none !important;
} */
</style>
