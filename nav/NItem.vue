<template>
  <b-nav-item :to="route" class="">
    <b-icon class="" :icon="icon" />
    <span v-if="expanded">
      {{ $t(title) }}
    </span>
  </b-nav-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class NItem extends Vue {
  @Prop({ }) expanded!: boolean
  @Prop({ }) title!: string
  @Prop({ }) icon!: string
  @Prop({ }) route!: string
}
</script>

<style>
/* .nav-tabs .nav-link{
  color: inherit !important;
} */
</style>
