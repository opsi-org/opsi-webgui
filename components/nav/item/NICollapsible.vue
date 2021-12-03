<template>
  <div>
    <b-nav-item v-b-toggle="'collapse-navitem-'+title" @click="changeRoute">
      <b-icon :icon="icon" /> {{ $t(title) }}
      <b-icon icon="caret-down-fill" class="caret_icon" font-scale="0.8" />
    </b-nav-item>
    <b-collapse :id="'collapse-navitem-'+title" accordion="sidebarAccordion">
      <b-nav vertical>
        <b-nav-item v-for="sub in submenu" :key="sub.title" :to="sub.route">
          <span class="submenu">
            {{ $t(sub.title) }}
          </span>
        </b-nav-item>
      </b-nav>
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class NICollapsible extends Vue {
  @Prop({ }) title!: string
  @Prop({ }) icon!: string
  @Prop({ }) route!: string
  @Prop({ }) submenu!: Array<object>
  changeRoute () {
    if ((this as any).$mq === 'desktop') {
      this.$router.push({ path: this.route })
    }
  }
}
</script>

<style>
.submenu{
  margin-left: 35px;
}
.caret_icon{
  float: right;
  margin-top: 5px;
}
</style>
