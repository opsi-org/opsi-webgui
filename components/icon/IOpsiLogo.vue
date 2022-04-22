<template>
  <img
    data-testid="IconIOpsiLogo"
    src="../../assets/images/LogoOpsi.png"
    alt="Click here to reload app"
    :class="{opsilogo_light: light}"
  >
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class IOpsiLogo extends Vue {
@Prop({ default: false }) light!: boolean
}
</script>

<style>
.opsilogo_light {
  filter: saturate(0) brightness(5) !important;
}
</style>
