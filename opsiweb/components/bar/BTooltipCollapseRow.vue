<template>
  <div>
    <b-nav-item
      v-b-toggle="`collapse-navitem-${title}`"
      light
    >
      <b-th class="text-left">
        <span v-if="collapseable">
          <b-icon v-if="collapsed" icon="chevron-double-down" />
          <b-icon v-else icon="chevron-double-right" />
        </span>
        {{ title }}
      </b-th>
      <b-th class="text-right">
        <b-badge :class="valueVariant">
          {{ value }}
        </b-badge>
      </b-th>
    </b-nav-item>
    <b-collapse :id="'collapse-navitem-'+title" accordion="sidebarAccordion" :visible="collapsed">
      <slot name="nav-child" />
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
// import { IObjectString2String, IObjectString2Function } from '~/types/tsettings'

@Component
export default class BTooltipCollpaseRow extends Vue {
  @Prop({ }) title!: string
  @Prop({ }) value!: string
  @Prop({ default: '' }) valueVariant!: string
  @Prop({ default: true }) collapseable!: boolean
  @Prop({ default: false }) collapsed!: boolean
}
</script>

<style>
.pageheader{
  height: var(--height-navbar) !important;
}
.pageheader_wrap {
  display: flex;
  flex-wrap: wrap;
}
.navbar {
  z-index: inherit !important;
}
</style>
