<template>
  <b-nav-item v-if="expanded" data-testid="NITitle" disabled>
    <small>{{ $t(title) }}</small>
  </b-nav-item>
  <b-nav-item v-else disabled />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class NITitle extends Vue {
  @Prop({ }) expanded!: boolean
  @Prop({ }) title!: string
}
</script>
