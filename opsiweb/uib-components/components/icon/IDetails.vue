<template>
  <div data-testid="IDetails" :class="'IDetails ' + content">
    <b-badge
      v-bind="$props"
      data-testid="IDetailsBadge"
      :variant="variant"
      size="sm"
    >
      <span v-if="content=='depot-unequal'" class="h6">
        <span> {{ text ? text: t_fixed('unequal') }}</span> <IconIIcon :icon="icon.server" />
      </span>
      <span v-else-if="content=='depot-wo-prod'" class="h6">
        {{ $t('notOrigin') }} <IconIIcon :icon="icon.server" />
      </span>
      <span v-else-if="content=='client-outdated'" class="h6">
        <span> {{ text ? text: t_fixed('unequal') }}</span> <IconIIcon :icon="icon.client" />
      </span>
      <span v-else-if="content=='ppv-client-different'" class="h6">
        <span> {{ text ? text: t_fixed('unequal') }}</span> <IconIIcon :icon="icon.client" />
      </span>
      <span v-else-if="content=='ppid-not-exists-on-depot'" class="h6">
        {{ t_fixed('unequal') }} <IconIIcon :icon="icon.server" />
      </span>
      <span v-else class="h6">{{ content==='unequal'? t_fixed('unequal'):content }} </span>
    </b-badge>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
import { Strings } from '../../mixins/strings'

@Component({ mixins: [Icons, Strings] })
export default class IDetails extends Vue {
  icon:any
  t_fixed:any
  @Prop({ default: '' }) text?: string
  @Prop({ default: '*' }) content?: string
  @Prop({ default: 'warning' }) variant?: string
}
</script>
