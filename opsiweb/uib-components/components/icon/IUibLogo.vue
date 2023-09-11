<template>
  <img
    v-if="short"
    data-testid="IconIUibLogo"
    src="../../assets/images/UIB_1704_2023_UIB_Schriftzug_quer.png"
    :class="{opsilogo_light: light, [classes]: true}"
  >
  <img
    v-else
    data-testid="IconIUibLogo"
    src="../../assets/images/UIB_1704_2023_UIB_Logo_quer.png"
    :class="{opsilogo_light: light, [classes]: true}"
  >
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
.opsilogo_light {
  filter: saturate(0) brightness(5) !important;
}
</style>
