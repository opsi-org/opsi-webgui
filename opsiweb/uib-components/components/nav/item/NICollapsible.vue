<template>
  <div data-testid="NICollapsible">
    <b-nav-item
      v-b-toggle="'collapse-navitem-'+title"
      :data-testid="'NICollapsible-'+title"
      :class="{checkactive: $route.path.includes(route.slice(0, -1))}"
      :disabled="disabled"
      @click.prevent="$mq == 'desktop' ? refresh(route) : ''"
    >
      <IconIIcon :icon="iconprop" /> {{ $t(title) }}
      <IconIIcon :icon="icon.arrowFillDown" class="caret_icon" font-scale="0.8" />
    </b-nav-item>
    <b-collapse :id="'collapse-navitem-'+title" accordion="sidebarAccordion">
      <b-nav vertical>
        <b-nav-item
          v-for="sub in submenu"
          :key="sub.title"
          :data-testid="'NICollapsible-submenu-'+title+sub.title"
          :disabled="sub.disabled"
          :class="{checkactive: $route.path.includes(sub.route)}"
          class="pl-3"
          @click.prevent="refresh(sub.route)"
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
import { Icons } from '../../../mixins/icons'

@Component({ mixins: [Icons] })
export default class NICollapsible extends Vue {
  $route: any
  $router:any
  $nuxt: any
  icon: any
  $mq:any
  @Prop({ }) title!: string
  @Prop({ default: false }) disabled!: boolean
  @Prop({ }) iconprop!: string
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
