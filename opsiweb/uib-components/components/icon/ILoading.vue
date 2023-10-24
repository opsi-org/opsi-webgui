<template>
  <div
    data-testid="ILoading"
    class="ILoading container-fluid"
    :style="'color:(--color, ' + color + ') !important;'"
  >
    <span v-if="!small" class="text-small">{{ $t('message.loading') }}</span>
    <IconIIcon class="loading-icon" :icon="icon.loading" :animation="animation" :title="$t('message.loading')" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class ILoading extends Vue {
  icon: any
  @Prop({ default: false }) small!: boolean
  @Prop({ default: 'cylon' }) animation!: string
  @Prop({ default: 'black' }) color!: string
}
</script>
<style>
.ILoading {
  max-width: fit-content;
}
</style>
