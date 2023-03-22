<template>
  <b-overlay :show="isLoading" no-wrap opacity="0.5" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class OLoading extends Vue {
  iconnames: any
  @Prop({ default: true }) isLoading?: boolean
}
</script>
