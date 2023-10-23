<template>
  <div
    data-testid="ILoading"
    class="ILoading container-fluid"
    :style="'color:(--color, ' + props.color + ') !important;'"
  >
  <!-- <br /> small {{ props.small }}
  <br /> animation {{ props.animation }}
  <br /> color {{ props.color }}
  <br /> icon.loading {{ icon.loading }}
  <br /> -->
    <span v-if="!props.small" class="text-small">{{ $t('message.loading') }}</span>
    <b-icon class="loading-icon" :icon="icon.loading" :animation="props.animation" :title="$t('message.loading')" />
  </div>
</template>

<script setup lang="ts">
import { useIcons } from '../../composables/mixins/useIcons'
const icon = useIcons()  // mixin - local => needs to be imported manually

const props = defineProps({
  small: { type: Boolean, default: false} ,
  animation: { type: String, default: 'cylon' },
  color: { type: String, default: 'black' },
})

</script>

<style scoped>
.ILoading {
  max-width: fit-content;
}
</style>
<!-- NUXT 2  was:  -->
<!-- <template>
  <div
    data-testid="ILoading"
    class="ILoading container-fluid"
    :style="'color:(--color, ' + color + ') !important;'"
  >
    <span v-if="!small" class="text-small">{{ $t('message.loading') }}</span>
    <b-icon class="loading-icon" :icon="icon.loading" :animation="animation" :title="$t('message.loading')" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class ILoading extends Vue {
  compatConfig: {
    MODE: 2, // opt-in to Vue 3 behavior for this component only
    FEATURE_ID_A: true // features can also be toggled at component level
  }
  icon: any
  $t:any
  @Prop({ default: false }) small!: boolean
  @Prop({ default: 'cylon' }) animation!: string
  @Prop({ default: 'black' }) color!: string
}
</script>
<style>
.ILoading {
  max-width: fit-content;
}
</style> -->
