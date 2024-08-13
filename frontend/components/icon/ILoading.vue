<template>
  <div
    data-testid="ILoading"
    class="ILoading container-fluid"
    :style="'color:(--color, ' + props.color + ') !important;'"
  >
    <span v-if="!props.small" class="text-small">{{ $t('message.loading') }}</span>
    <IconIIcon class="loading-icon" :icon="icon.loading" :title="$t('message.loading')" />
  </div>
</template>

<script setup lang="ts">
import { useIcons } from '../../composables/mixins/useIcons'
const icon = useIcons()

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

