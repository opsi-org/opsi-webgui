<template>
  <b-button
    v-bind="$props"
    class="border-0 float-right text-small p-0 m-0 small"
    variant="transparent"
    data-testid="ButtonBTNSmallRow"
    size="sm"
    @click="$emit('click')"
  >
    <template v-if="showClose !== false">
      <span class="sr-only">{{ $t('button.deselect') }}</span>
      <b-icon :icon="icon.x" class="m-0" />
    </template>
    <template v-if="showReset !== false">
      <span class="sr-only">{{ $t('button.reset') }}</span>
      <b-icon :icon="icon.reset" class="m-0" sm />
    </template>
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class BTNSmallRow extends Vue {
  icon:any // mixin
  @Prop({ default: false }) showClose!: boolean
  @Prop({ default: false }) showReset!: boolean
}
</script>

<style>
/* [data-testid="ButtonBTNSmallRow"], */
[data-testid="ButtonBTNSmallRow"]{
  --btnsmallrowsize: fit-content;
  min-height: var(--btnsmallrowsize) !important;
  max-height: var(--btnsmallrowsize) !important;
  /* background-color: transparent; */
}
[data-testid="ButtonBTNSmallRow"]:hover {
  background-color: var(--b-tab_content) !important;
  /* color: var(--primary-foreground) !important; */
}
</style>
