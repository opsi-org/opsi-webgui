<template>
  <b-button
    v-if="!isLoading"
    variant="outline-dark"
    class="float-right"
    @click="refetch"
  >
    {{ $t('button.tryAgain') }}
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class BTNRefetch extends Vue {
  iconnames:any
  @Prop({ default: true }) isLoading?: boolean
  @Prop({ default: () => { return () => { /* default */ } } }) refetch!: Function
}
</script>
