<template>
  <div>
    <!-- @click="changeRoute" -->
    <b-nav-item
      id="parentnav"
      v-b-toggle="'collapse-navitem-'+title"
      :class="{checkactive: $route.path.includes(route.slice(0, -1))}"
      :to="$mq === 'desktop' ? route: null "
      @click="refresh(route)"
      :disabled="disabled"
    >
      <b-icon :icon="icon" /> {{ $t(title) }}
      <b-icon :icon="iconnames.arrowFillDown" class="caret_icon" font-scale="0.8" />
    </b-nav-item>
    <b-collapse :id="'collapse-navitem-'+title" accordion="sidebarAccordion">
      <b-nav vertical>
        <b-nav-item
          v-for="sub in submenu"
          :key="sub.title"
          :disabled="sub.disabled"
          :class="{checkactive: $route.path.includes(sub.route)}"
          :to="sub.route"
          @click="refresh(sub.route)"
        >
          <span class="submenu" :data-testid="'NICollapsible-submenu-'+sub.title">
            {{ $t(sub.title) }}
          </span>
        </b-nav-item>
      </b-nav>
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class NICollapsible extends Vue {
  $route: any
  $nuxt: any
  iconnames: any
  @Prop({ }) title!: string
  @Prop({ default: false }) disabled!: boolean
  @Prop({ }) icon!: string
  @Prop({ }) route!: string
  @Prop({ }) submenu!: Array<any>
  // changeRoute () {
  //   if ((this as any).$mq === 'desktop') {
  //     this.$router.push({ path: this.route })
  //   }
  // }

  refresh (route) {
    if (this.$route.path.includes(route)) {
      this.$nuxt.refresh()
    }
  }
}
</script>

<style>
.checksubactive.nav-item {
  color:white;
  background-color: #025077;
}
.submenu{
  margin-left: 5px;
}
.caret_icon{
  float: right;
  margin-top: 5px;
}
</style>
