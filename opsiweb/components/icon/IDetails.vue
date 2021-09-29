<template>
  <b-badge
    v-bind="$props"
    :variant="variant"
  >
    {{ content==='unequal'? '&ne;':content }}
  </b-badge>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class IDetails extends Vue {
  @Prop({ default: '*' }) content?: string
  @Prop({ default: 'warning' }) variant?: string
}
</script>

<style>
</style>
