<template>
  <div data-testid="TCInstallationStatus">
    <b-badge v-if="text=='mixed'" data-testid="TCInstallationStatusBadge" :variant="variant">
      <span class="h6"> {{ $t('unequal') }} </span>
    </b-badge>
    <b-badge v-else-if="text=='installed'" data-testid="TCInstallationStatusBadge" variant="success">
      <span class="h6">
        <b-icon :icon="icon.client" alt="installed" :title="text" />
      </span>
    </b-badge>
    <b-badge v-else-if="text=='unknown'" data-testid="TCInstallationStatusBadge" variant="warning" text-variant="dark">
      <span class="h6">
        <b-icon :icon="icon.productInstallationStatusUnknown" :alt="text" />
      </span>
    </b-badge>
    <b-badge v-else-if="$mq=='mobile'&&(text=='not_installed'||text==''||text=='none')" data-testid="TCInstallationStatusBadge" variant="transparent">
      <span class="h6"> {{ ($mq=='mobile')? $t('keep-english.empty'):'' }} </span>
    </b-badge>
    <b-badge v-else-if="$mq!='mobile'&&(text=='not_installed'||text==''||text=='none')" data-testid="TCInstallationStatusBadge" variant="transparent" />
    <b-badge v-else data-testid="TCInstallationStatusBadge" :variant="variant">
      <span class="h6"> {{ text }} </span>
    </b-badge>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../../mixins/icons'

@Component({ mixins: [Icons] })
export default class TCInstallationStatus extends Vue {
  icon: any // from mixin
  $mq:any

  @Prop({ }) text!: string
  @Prop({ default: 'warning' }) variant!: string
}
</script>
