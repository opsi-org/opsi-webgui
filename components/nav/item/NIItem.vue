<template>
  <b-nav-item :to="route" class="NItem-nav-item" @click="refresh(route)">
    <b-icon v-b-tooltip.hover :title="$t(title)" class="" :icon="icon" />
    <span v-if="expanded">
      {{ $t(title) }}
    </span>
  </b-nav-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class NIItem extends Vue {
  $nuxt: any
  @Prop({ }) expanded!: boolean
  @Prop({ }) title!: string
  @Prop({ }) icon!: string
  @Prop({ }) route!: string
  refresh (route) {
    if (this.$route.path.includes(route)) {
      this.$nuxt.refresh()
    }
  }
}
</script>

<style>
.NItem-nav-item{
  z-index: 1999;
}
</style>
