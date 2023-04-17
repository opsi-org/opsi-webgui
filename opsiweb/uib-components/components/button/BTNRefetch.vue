<template>
  <b-button
    v-b-tooltip.hover
    data-testid="BTNRefetch"
    :title="tooltip && !label ? tooltip : ''"
    :variant="(tooltip || incontextmenu !== false )? 'outline-primary' : 'outline-dark'"
    class="BTNRefetch btn-sm"
    :class="{
      'border-0': incontextmenu !== false,
      'dropdown-item': incontextmenu !== false,
      'float-right': incontextmenu === false
    }"
    :disabled="isLoading==true"
    @click="refetch"
  >
    <b-icon :icon="icon.refresh" />
    <template v-if="label && incontextmenu !== false">
      <small style="font-size: 85%;">{{ label }}</small>
    </template>
    <div v-else-if="!tooltip">
      <span class="refreshlabel"> {{ $t('button.tryAgain') }} </span>
    </div>
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class BTNRefetch extends Vue {
  icon:any
  @Prop({ default: true }) isLoading?: boolean
  @Prop({ default: '' }) tooltip?: string
  @Prop({ default: undefined }) label?: string
  @Prop({ default: false }) incontextmenu!: boolean
  @Prop({ default: () => { return () => { /* default */ } } }) refetch!: Function
}
</script>

<style>
.BTNRefetch,
.BTNRefetch > svg,
.BTNRefetch > div {
  display: inline-block !important;
}
</style>
