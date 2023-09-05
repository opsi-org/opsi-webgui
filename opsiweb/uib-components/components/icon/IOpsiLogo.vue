<template>
  <img
    v-if="short"
    data-testid="IconIOpsiLogo"
    src="../../assets/images/UIB_1704_2023_OPSI_Logo_Bildmarke_ohne_Text_quer.png"
    :alt="translatedLabel"
    :class="{opsilogo_light: light}"
  >
  <img
    v-else
    data-testid="IconIOpsiLogo"
    src="../../assets/images/UIB_1704_2023_OPSI_Logo_Bildmarke_quer.png"
    :alt="translatedLabel"
    :class="{opsilogo_light: light}"
  >
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class IOpsiLogo extends Vue {
  @Prop({ default: true }) short!: boolean
  @Prop({ default: false }) light!: boolean
  $t: any
  translatedLabel: string = ''

  mounted () {
    this.translatedLabel = this.$t('button.reload.app')
  }
}
</script>

<style>
.opsilogo_light {
  filter: saturate(0) brightness(5) !important;
}
</style>
