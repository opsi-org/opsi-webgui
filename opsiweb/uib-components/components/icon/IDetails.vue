<template>
  <div data-testid="IDetails" :class="'IDetails ' + content">
    <b-badge
      v-bind="$props"
      data-testid="IDetailsBadge"
      :variant="variant"
    >
      <span v-if="content=='depot-unequal'" class="h6">
        <span> {{ text ? text: $t('unequal') }}</span> <b-icon :icon="iconnames.depot" />
      </span>
      <span v-else-if="content=='depot-wo-prod'" class="h6">
        {{ $t('notOrigin') }} <b-icon :icon="iconnames.depot" />
      </span>
      <span v-else-if="content=='client-outdated'" class="h6">
        <span> {{ text ? text: $t('unequal') }}</span> <b-icon :icon="iconnames.client" />
      </span>
      <span v-else-if="content=='ppv-client-different'" class="h6">
        <span> {{ text ? text: $t('unequal') }}</span> <b-icon :icon="iconnames.client" />
      </span>
      <span v-else-if="content=='ppid-not-exists-on-depot'" class="h6">
        {{ $t('unequal') }} <b-icon :icon="iconnames.depot" />
      </span>
      <span v-else class="h6">{{ content==='unequal'? $t('unequal'):content }} </span>
    </b-badge>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class IDetails extends Vue {
  iconnames:any
  @Prop({ default: '' }) text?: string
  @Prop({ default: '*' }) content?: string
  @Prop({ default: 'warning' }) variant?: string
}
</script>
