<template>
  <div>
    <b-navbar data-testid="BarBPageHeader" variant="transparent" class="p-1">
      <div v-b-toggle="'collapse' + tableid" :class="navbartype == 'collapse' ? 'btn col-10 text-left border-0 pl-0' : 'text-small'">
        <b-icon v-if="navbartype == 'collapse'" :icon="expanded ? icon.arrowDoubleDown : icon.arrowDoubleRight" />
        <span v-if="title" class="font-weight-bold tableheader_title">{{ title }}</span>
        <span v-if="subtitle" class="font-italic ml-1"> {{ subtitle }} </span>
      </div>
      <b-navbar-nav class="flex-wrap">
        <slot name="left" />
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <slot name="right" />
        <b-button v-if="closeroute" size="sm" class="border-0" variant="outline-primary" :to="closeroute">
          <span class="sr-only">{{ $t('button.close') }}</span> <b-icon :icon="icon.x" />
        </b-button>
      </b-navbar-nav>
    </b-navbar>
    <b-collapse v-if="tableid" :id="'collapse' + tableid" v-model="expanded" :visible="expanded">
      <b-navbar class="flex-wrap p-0">
        <template v-if="tableid">
          <TreeTSDepots v-if="showDepot()" />
          <TreeTSHostGroups v-if="showClientGroup()" /><slot name="expandClientGroup" />
          <TreeTSProductGroups v-if="tableid == 'products' && !treeview" /><slot v-if="showExpandProdGroup()" name="expandProdGroup" />
        </template>
      </b-navbar>
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class BPageHeader extends Vue {
  @Prop({ default: 'expand' }) navbartype!: string
  @Prop({}) title!: string
  @Prop({}) subtitle!: string
  @Prop({}) closeroute!: string
  @Prop({ default: null }) tableid!: string
  @Prop({ default: false }) childopened!: boolean
  @Prop({ default: false }) treeview!: boolean
  icon:any
  $route:any
  expanded: boolean = true
  @Watch('childopened', {}) childOpened () { this.expanded = !this.childopened }

  showDepot () {
    if (this.tableid === 'Clients') {
      return true
    } else if (this.tableid === 'products' && !this.$route.path.includes('clients/products')) {
      return true
    } else { return false }
  }

  showClientGroup () {
    if (this.tableid === 'Clients' && !this.treeview) {
      return true
    } else if (this.tableid === 'products' && !this.$route.path.includes('clients/products')) {
      return true
    } else { return false }
  }

  showExpandProdGroup () {
    if (this.tableid === 'products' && !this.$route.path.includes('clients/products')) {
      return true
    } else { return false }
  }
}
</script>
