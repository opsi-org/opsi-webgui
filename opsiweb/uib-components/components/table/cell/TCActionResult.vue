<template>
  <div data-testid="TCActionResult">
    <b-badge v-if="text=='mixed'" data-testid="TCActionResultBadge" :variant="variant">
      <span class="h6"> {{ $t('unequal') }} </span>
    </b-badge>
    <b-badge v-else-if="text=='successful'" data-testid="TCActionResultBadge" variant="success">
      <span class="h6"> <b-icon :icon="iconnames.productActionResultSuccessful" alt="successful" /> </span>
    </b-badge>
    <b-badge v-else-if="text=='failed'" data-testid="TCActionResultBadge" variant="danger">
      <span class="h6"> <b-icon :icon="iconnames.productActionResultFailed" alt="failed" /> </span>
    </b-badge>
    <b-badge v-else-if="$mq=='mobile'&&(text=='not_installed'||text==''||text=='none')" data-testid="TCActionResultBadge" variant="transparent">
      <span class="h6"> {{ ($mq=='mobile')? $t('empty'):'' }} </span>
    </b-badge>
    <b-badge v-else-if="$mq!='mobile'&&(text=='not_installed'||text==''||text=='none')" data-testid="TCActionResultBadge" variant="transparent" />
    <b-badge v-else data-testid="TCActionResultBadge" :variant="variant">
      <span class="h6"> {{ text }} </span>
    </b-badge>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class TCActionResult extends Vue {
  $mq: any
  iconnames: any
  @Prop({ }) text!: string
  @Prop({ default: 'warning' }) variant!: string
}
</script>
