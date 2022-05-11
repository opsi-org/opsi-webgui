<template>
  <div @mouseover="onMouseOver" @mouseleave="onMouseLeave">
    <b-nav-item-dropdown
      ref="dropdown"
      class="sidemenu_dropdown"
      :class="{checkactive: $route.path.includes(route.slice(0, -1))}"
      block
      dropright
      no-caret
      :disabled="disabled"
    >
      <template #button-content>
        <b-icon :icon="icon" @click="changeRoute" />
      </template>
      <b-dropdown-item disabled>
        {{ $t(title) }}
      </b-dropdown-item>
      <b-dropdown-divider />
        <!-- class="d-inline-block" -->
      <span
        v-for="sub in submenu"
        :key="sub.title"
      >
        <b-dropdown-item
          :class="{checkactive: $route.path.includes(sub.route)}"
          :to="sub.route"
          :style="(sub.disabled)? 'pointer-events: none;':''"
          :disabled="sub.disabled"
          @click="refresh(sub.route)"
        >
          {{ $t(sub.title) }}
        </b-dropdown-item>
      </span>
    </b-nav-item-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class NIDropdownHoverable extends Vue {
  $route: any
  $router: any
  $nuxt: any
  @Prop({ }) title!: string
  @Prop({ default: false }) disabled!: boolean
  @Prop({ }) icon!: string
  @Prop({ }) route!: string
  @Prop({ }) submenu!: Array<any>

  onMouseOver () {
    (this.$refs.dropdown as any).visible = true
  }

  onMouseLeave () {
    (this.$refs.dropdown as any).visible = false
  }

  changeRoute () {
    this.$router.push({ path: this.route })
    this.refresh(this.route)
  }

  refresh (route) {
    if (this.$route.path.includes(route)) {
      this.$nuxt.refresh()
    }
  }
}
</script>

<style>
.sidemenu_dropdown .dropdown-menu{
  left: calc(var(--width-sidebar-collapsed) - 6px) !important;
}
.checkactive.nav-item {
  color:white;
  background-color: #025077
}
</style>
