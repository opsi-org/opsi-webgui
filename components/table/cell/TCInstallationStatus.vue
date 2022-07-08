<template>
  <div data-testid="TCActionResult">
    <b-badge v-if="text=='mixed'" :variant="variant">
      <span class="h6"> {{ $t('unequal') }} </span>
    </b-badge>
    <b-badge v-else-if="text=='installed'" variant="success">
      <span class="h6">
        <b-icon :icon="iconnames.productInstallationStatusInstalled" alt="installed" :title="text" />
      </span>
    </b-badge>
    <b-badge v-else-if="text=='unknown'" variant="warning" text-variant="dark">
      <span class="h6">
        <b-icon :icon="iconnames.productInstallationStatusUnknown" :alt="text" />
      </span>
    </b-badge>
    <b-badge v-else-if="$mq=='mobile'&&(text=='not_installed'||text==''||text=='none')" variant="transparent">
      <span class="h6"> {{ ($mq=='mobile')? $t('empty'):'' }} </span>
    </b-badge>
    <b-badge v-else-if="$mq!='mobile'&&(text=='not_installed'||text==''||text=='none')" variant="transparent" />
    <b-badge v-else :variant="variant">
      <span class="h6"> {{ text }} </span>
    </b-badge>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class TCInstallationStatus extends Vue {
  iconnames: any // from mixin
  $mq:any

  @Prop({ }) text!: string
  @Prop({ default: 'warning' }) variant!: string
}
</script>
