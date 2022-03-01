<template>
  <div>
    <b-row data-testid="GTwoColumnLayout">
      <b-button
        v-if="$mq !== 'mobile' && $route.path.includes('clients/products/config') && parentId === 'tableclients'"
        class="clients_button border-primary"
        variant="transparent"
        :pressed.sync="expandClients"
      >
        <small><b>{{ expandClients? 'Hide': 'Show' }} Clients {{ expandClients? '': '>>' }}</b></small>
      </b-button>
      <b-col
        id="parentcol"
        :class="{'d-none' : showchild && $mq === 'mobile' || $route.path.includes('clients/products/config') && parentId === 'tableclients' && !expandClients ,
                 column2visible: showchild}"
      >
        <slot name="parent" />
      </b-col>
      <b-col v-if="showchild" :class="{column2visible: Boolean(showchild)}">
        <slot name="child" />
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
const settings = namespace('settings')

@Component
export default class GTwoColumnLayout extends Vue {
  $mq:any
  expandClients: boolean = false
  @Prop({ default: 'default' }) parentId!: string
  @Prop({ }) showchild!: string

  @settings.Getter public twoColumnLayoutCollapsed!: Array<string>
  @settings.Mutation public setColumnLayoutCollapsed!: (obj: object) => void

  @Watch('showchild') layoutColumnChanged () {
    this.setColumnLayoutCollapsed({ parentId: this.parentId, value: Boolean(this.showchild) })
  }

  mounted () {
    this.layoutColumnChanged()
  }
}
</script>

<style>
.clients_button{
  max-width:60px;
  max-height:800px;
}
</style>
