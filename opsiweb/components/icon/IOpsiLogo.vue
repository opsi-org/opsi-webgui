<template>
  <img src="../../assets/images/LogoOpsi.png" alt="opsi logo" :height="height" :width="width">
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class NSidebar extends Vue {
  @Prop({ default: '60%' }) height!: string
  @Prop({ default: '61%' }) width!: string
}
</script>
<style>
</style>
