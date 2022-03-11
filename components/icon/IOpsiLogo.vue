<template>
  <img data-testid="IconIOpsiLogo" src="~/uib-components/assets/images/LogoOpsi.png" alt="opsi logo" class="OpsiLogo_Img">
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class IOpsiLogo extends Vue {
}
</script>

<style>
.OpsiLogo_Img {
  /* max-width: 60%;
  max-height: 60%; */
  /* filter: saturate(0) brightness(6) !important; */
  /* filter: saturate(0) brightness(0); */
  /* filter: saturate(0) brightness(6); */
  filter: saturate(0) brightness(60%);
  /* color: var(--fg-type); */
   /* invert(100%); */
  /* filter: saturate(0) brightness(6) invert(calc(var(--fg-type))); */
}
</style>
