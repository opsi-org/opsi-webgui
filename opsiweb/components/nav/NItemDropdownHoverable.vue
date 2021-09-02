<template>
  <div @mouseover="onMouseOver" @mouseleave="onMouseLeave">
    <!-- @click="changeRoute" -->
    <b-nav-item-dropdown ref="dropdown" class="sidemenu_dropdown" block dropright no-caret>
      <template #button-content>
        <b-icon :icon="icon" />
      </template>
      <b-dropdown-item disabled>
        {{ $t(title) }}
      </b-dropdown-item>
      <b-dropdown-divider />
      <b-dropdown-item v-for="sub in submenu" :key="sub.title" :to="sub.route">
        {{ $t(sub.title) }}
        <!-- {{ sub.title }} -->
      </b-dropdown-item>
    </b-nav-item-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class NItemDropdownHoverable extends Vue {
  @Prop({ }) title!: string
  @Prop({ }) icon!: string
  @Prop({ }) route!: string
  @Prop({ }) submenu!: Array<object>

  onMouseOver () {
    (this.$refs.dropdown as any).visible = true
  }

  onMouseLeave () {
    (this.$refs.dropdown as any).visible = false
  }

  // changeRoute () {
  //   // return redirect('/login')
  //   this.$router.push({ path: this.route })
  // }
}
</script>

<style>
.sidemenu_dropdown .dropdown-menu{
  left: calc(var(--width-sidebar-collapsed) - 6px) !important;
}
</style>
