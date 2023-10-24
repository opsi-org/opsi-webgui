<template>
  <div
    :data-testid="'NIDropdownHoverable-'+title"
    @mouseover="onOver($refs.sidemenudropdown)"
    @mouseleave="onLeave($refs.sidemenudropdown)"
    @focus="onOver($refs.sidemenudropdown)"
    @blur="onLeave($refs.sidemenudropdown)"
  >
    <b-nav-item-dropdown
      ref="sidemenudropdown"
      class="sidemenu_dropdown"
      :class="{checkactive: $route.path.includes(route.slice(0, -1))}"
      block
      dropright
      no-caret
      :disabled="disabled"
    >
      <template #button-content>
        <IconIIcon :icon="icon" @click="refresh(route)" />
      </template>
      <b-dropdown-item disabled>
        {{ $t(title) }}
      </b-dropdown-item>
      <b-dropdown-divider />
      <span
        v-for="sub in submenu"
        :key="sub.title"
      >
        <b-dropdown-item
          :class="{checkactive: $route.path.includes(sub.route)}"
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
import { HoverDropdown } from '../../../mixins/component'

@Component({ mixins: [HoverDropdown] })
export default class NIDropdownHoverable extends Vue {
  $route: any
  $router: any
  $nuxt: any
  onOver: any
  onLeave: any
  @Prop({ }) title!: string
  @Prop({ default: false }) disabled!: boolean
  @Prop({ }) icon!: string
  @Prop({ }) route!: string
  @Prop({ }) submenu!: Array<any>

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
.sidemenu_dropdown .dropdown-menu{
  left: calc(var(--width-sidebar-collapsed) - 6px) !important;
}
.checkactive.nav-item {
  color:white;
  background-color: #025077
}
</style>
