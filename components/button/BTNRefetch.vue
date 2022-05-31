<template>
  <b-button
    v-b-tooltip.hover
    :title="tooltip? tooltip : ''"
    :variant="tooltip? 'outline-primary border-0' : 'outline-dark'"
    class="float-right btn-sm"
    :disabled="isLoading==true"
    @click="refetch"
  >
    <b-icon v-if="tooltip" :icon="iconnames.refresh" />
    <div v-else>
      {{ $t('button.tryAgain') }}
    </div>
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class BTNRefetch extends Vue {
  iconnames:any
  @Prop({ default: true }) isLoading?: boolean
  @Prop({ default: '' }) tooltip?: string
  @Prop({ default: () => { return () => { /* default */ } } }) refetch!: Function
}
</script>
