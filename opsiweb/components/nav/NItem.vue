<template>
  <div>
    <b-nav-item :to="route">
      <b-icon :icon="icon" />
      <span v-if="expanded">
        {{ $t(title) }}
      </span>
    </b-nav-item>
  </div>
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
.nav-tabs .nav-link{
  color: lightgray !important;
}
</style>
