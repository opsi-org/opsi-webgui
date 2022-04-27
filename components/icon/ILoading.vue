<template>
  <div class="ILoading container-fluid" data-testid="ILoading">
    {{ (small)? '': $t('message.loading') }}
    <b-icon class="loading-icon" :icon="iconnames.loading" :animation="animation" :title="$t('message.loading')" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class ILoading extends Vue {
  iconnames: any
  @Prop({ default: false }) small!: boolean
  @Prop({ default: 'cylon' }) animation!: string
}
</script>
<style>
.ILoading {
  max-width: fit-content;
}
</style>
