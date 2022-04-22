<template>
  <div>
    <b-nav-item
      v-b-toggle="`collapse-navitem-${title}`"
      data-testid="BarBTooltipCollapseRow"
      class="collapse-navitem BarBTooltipCollapseRow"
      light
    >
      <b-th class="text-left">
        <span v-if="collapseable">
          <b-icon v-if="collapsed" :icon="iconnames.arrowDoubleDown" />
          <b-icon v-else :icon="iconnames.arrowDoubleRight" />
        </span>
        {{ title }}
      </b-th>
      <b-th class="text-right">
        <b-badge :variant="valueVariant">
          {{ value }}
        </b-badge>
      </b-th>
    </b-nav-item>
    <b-collapse :id="'collapse-navitem-'+title" accordion="tooltipCollapseAccordion" :visible="collapsed">
      <slot name="nav-child" />
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class BTooltipCollapseRow extends Vue {
  iconnames: any
  @Prop({ }) title!: string
  @Prop({ }) value!: string
  @Prop({ default: 'info' }) valueVariant!: string
  @Prop({ default: true }) collapseable!: boolean
  @Prop({ default: false }) collapsed!: boolean
}
</script>

<style>
.BarBTooltipCollapseRow {
  list-style: none !important;
}
.pageheader{
  height: var(--height-navbar) !important;
}
.pageheader_wrap {
  display: inline-flex;
  flex-wrap: wrap;
}
.navbar {
  z-index: inherit !important;
}
.collapse{
  padding-left: 20px;
}
</style>
