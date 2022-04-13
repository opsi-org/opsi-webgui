<template>
  <div>
    <b-nav-item
      id="parentnav"
      v-b-toggle="'collapse-navitem-'+title"
      :class="{checkactive: $route.path.includes(route)}"
      @click="changeRoute"
    >
      <b-icon :icon="icon" /> {{ $t(title) }}
      <b-icon :icon="iconnames.arrowFillDown" class="caret_icon" font-scale="0.8" />
    </b-nav-item>
    <b-collapse :id="'collapse-navitem-'+title" accordion="sidebarAccordion">
      <b-nav vertical>
        <b-nav-item
          v-for="sub in submenu"
          :key="sub.title"
          :class="{checksubactive: $route.path == (sub.route)}"
          :to="sub.route"
          @click="refresh(sub.route)"
        >
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
import { Constants } from '../../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class NICollapsible extends Vue {
  $nuxt: any
  iconnames: any
  @Prop({ }) title!: string
  @Prop({ }) icon!: string
  @Prop({ }) route!: string
  @Prop({ }) submenu!: Array<any>
  changeRoute () {
    if ((this as any).$mq === 'desktop') {
      this.$router.push({ path: this.route })
    }
  }

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
