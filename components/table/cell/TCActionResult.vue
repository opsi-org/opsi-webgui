<template>
  <b-badge v-if="text=='mixed'" :variant="variant">
    &#8800;
  </b-badge>
  <b-badge v-else-if="text=='successful'" variant="success">
    <b-icon :icon="iconnames.productActionResultSuccessful" alt="successful" />
  </b-badge>
  <b-badge v-else-if="text=='failed'" variant="danger">
    <b-icon :icon="iconnames.productActionResultFailed" alt="failed" />
  </b-badge>
  <b-badge v-else-if="$mq=='mobile'&&(text=='not_installed'||text==''||text=='none')" variant="transparent">
    {{ ($mq=='mobile')? '-':'' }}
  </b-badge>
  <b-badge v-else-if="$mq!='mobile'&&(text=='not_installed'||text==''||text=='none')" variant="transparent" />
  <b-badge v-else>
    {{ text }}
  </b-badge>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class TCSpan extends Vue {
  $mq: any
  iconnames: any
  @Prop({ }) text!: string
  @Prop({ default: 'warning' }) variant!: string
}
</script>
