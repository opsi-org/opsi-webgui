<template>
  <div>
    <b-nav-item
      v-b-toggle="`collapse-navitem-${title}`"
      data-testid="BarBTooltipCollapseRow"
      class="collapse-navitem BarBTooltipCollapseRow"
    >
      <b-th class="text-left text-small">
        <span v-if="collapseable" class="text-small">
          <IconIIcon :icon="collapsed ? icon.arrowDoubleDown : icon.arrowDoubleRight" />
        </span>
        {{ title }}
      </b-th>
      <b-th class="text-right text-small">
        <b-badge :variant="valueVariant">
          {{ value }}
        </b-badge>
      </b-th>
    </b-nav-item>
    <b-collapse :id="'collapse-navitem-'+title" accordion="tooltipCollapseAccordion" :visible="collapsed" class="BarBTooltipCollapse">
      <slot name="nav-child" />
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class BTooltipCollapseRow extends Vue {
  icon: any
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
.BarBTooltipCollapseRow.navbar {
  z-index: inherit !important;
}
.BarBTooltipCollapse .collapse{
  padding-left: 20px;
}
</style>
