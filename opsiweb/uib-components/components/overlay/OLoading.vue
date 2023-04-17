<template>
  <b-overlay :show="isLoading" no-wrap opacity="0.5" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class OLoading extends Vue {
  @Prop({ default: true }) isLoading?: boolean
}
</script>
