<template>
  <b-navbar data-testid="BarBPageHeader" variant="transparent" class="p-0">
    <div class="text-small">
      <span v-if="title" class="font-weight-bold tableheader_title">{{ title }}</span>
      <span v-if="subtitle" class="font-italic ml-1"> {{ subtitle }} </span>
    </div>
    <b-navbar-nav class="flex-wrap">
      <slot name="left" />
    </b-navbar-nav>
    <b-navbar-nav class="ml-auto">
      <slot name="right" />
      <b-button v-if="closeroute" size="sm" class="border-0" variant="outline-primary" :to="closeroute">
        <span class="sr-only">{{ $t('button.close') }}</span> <IconIIcon :icon="icon.x" />
      </b-button>
    </b-navbar-nav>
  </b-navbar>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class BPageHeader extends Vue {
  @Prop({}) title!: string
  @Prop({}) subtitle!: string
  @Prop({}) closeroute!: string
  icon:any
}
</script>
