<template>
  <img
    data-testid="IconIOpsiLogo"
    src="../../assets/images/LogoOpsi.png"
    :alt="translatedLabel"
    :class="{opsilogo_light: light}"
  >
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class IOpsiLogo extends Vue {
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
