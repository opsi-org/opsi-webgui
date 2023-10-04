<template>
  <b-button
    data-testid="BTNRefetch"
    :title="tooltip && !label ? tooltip : ''"
    :variant="(tooltip || incontextmenu !== false )? 'outline-primary border-0' : 'outline-dark'"
    class="BTNRefetch"
    size="sm"
    :class="{
      'incontextmenu': incontextmenu !== false,
      'border-0': incontextmenu !== false,
      'dropdown-item': incontextmenu !== false,
      'float-right': incontextmenu === false
    }"
    :disabled="isLoading==true"
    @click="refetch"
  >
    <b-icon :icon="icon.refresh" />
    <template v-if="label && incontextmenu !== false">
      {{ label }}
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
