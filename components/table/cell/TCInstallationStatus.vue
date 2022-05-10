<template>
  <b-badge v-if="text=='mixed'" :variant="variant">
    <span class="h5"> &#8800; </span>
  </b-badge>
  <b-badge v-else-if="text=='installed'" variant="success">
    <span class="h5">
      <b-icon :icon="iconnames.productInstallationStatusInstalled" alt="installed" title="installed" />
    </span>
  </b-badge>
  <b-badge v-else-if="text=='unknown'" variant="warning" text-variant="dark">
    <span class="h5">
      <b-icon :icon="iconnames.productInstallationStatusUnknown" alt="unknown" />
    </span>
  </b-badge>
  <b-badge v-else-if="$mq=='mobile'&&(text=='not_installed'||text==''||text=='none')" variant="transparent">
    <span class="h5"> {{ ($mq=='mobile')? '-':'' }} </span>
  </b-badge>
  <b-badge v-else-if="$mq!='mobile'&&(text=='not_installed'||text==''||text=='none')" variant="transparent" />
  <b-badge v-else>
    <span class="h5"> {{ text }} </span>
  </b-badge>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class TCSpan extends Vue {
  iconnames: any // from mixin
  $mq:any

  @Prop({ }) text!: string
  @Prop({ default: 'warning' }) variant!: string
}
</script>
