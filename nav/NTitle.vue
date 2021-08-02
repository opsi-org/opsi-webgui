<template>
  <b-nav-item v-if="expanded" disabled>
    {{ $t(title) }}
  </b-nav-item>
  <b-nav-item v-else disabled />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class NTitle extends Vue {
  @Prop({ }) expanded!: boolean
  @Prop({ }) title!: string
}
</script>

<style>
.nav-tabs .nav-link.disabled {
  color: black;
}
</style>
