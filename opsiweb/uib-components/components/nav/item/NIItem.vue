<template>
  <b-nav-item :data-testid="'NIItem-'+title" :title="$t(title)" class="NItem-nav-item" :disabled="disabled" @click.prevent="refresh(route)">
    <IconIIcon :icon="icon" />
    <span v-if="expanded">
      {{ $t(title) }}
    </span>
  </b-nav-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class NIItem extends Vue {
  $route: any
  $router: any
  $nuxt: any
  @Prop({ }) expanded!: boolean
  @Prop({ }) title!: string
  @Prop({ default: false }) disabled!: boolean
  @Prop({ }) icon!: string
  @Prop({ }) route!: string
  refresh (route) {
    if (this.$route.path.includes(route)) {
      this.$nuxt.refresh()
    } else {
      this.$router.push({ path: route })
    }
  }
}
</script>

<style>
.NItem-nav-item{
  z-index: 1999;
}
</style>
