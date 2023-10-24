<template>
  <div data-testid="TCActionResult">
    <b-badge v-if="text=='mixed'" data-testid="TCActionResultBadge" :variant="variant">
      <span class="h6"> {{ t_fixed('unequal') }} </span>
    </b-badge>
    <b-badge v-else-if="text=='successful'" data-testid="TCActionResultBadge" variant="success">
      <span class="h6"> <IconIIcon :icon="icon.productActionResultSuccessful" alt="successful" /> </span>
    </b-badge>
    <b-badge v-else-if="text=='failed'" data-testid="TCActionResultBadge" variant="danger">
      <span class="h6"> <IconIIcon :icon="icon.x" alt="failed" /> </span>
    </b-badge>
    <b-badge v-else-if="$mq=='mobile'&&(text=='not_installed'||text==''||text=='none')" data-testid="TCActionResultBadge" variant="transparent">
      <span class="h6"> {{ ($mq=='mobile')? t_fixed('keep-english.empty') : '' }} </span>
    </b-badge>
    <b-badge v-else-if="$mq!='mobile'&&(text=='not_installed'||text==''||text=='none')" data-testid="TCActionResultBadge" variant="transparent" />
    <b-badge v-else data-testid="TCActionResultBadge" :variant="variant">
      <span class="h6"> {{ text }} </span>
    </b-badge>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../../mixins/icons'
import { Strings } from '../../../mixins/strings'

@Component({ mixins: [Icons, Strings] })
export default class TCActionResult extends Vue {
  $mq: any
  icon: any
  t_fixed: any
  @Prop({ }) text!: string
  @Prop({ default: 'warning' }) variant!: string
}
</script>
