<template>
  <div
    data-testid="ILoading"
    class="ILoading container-fluid"
    :style="'color:(--color, ' + props.color + ') !important;'"
    :class="{'inline': props.inline}"
  >
    <span
      v-if="!props.small"
      class="text-small"
      :class="{'inline': props.inline}"
    >
      {{ $t('message.loading') }}
    </span>
    <IconIIcon
      :icon="icon.loading"
      :title="$t('message.loading')"
      :class="{
        'loading-icon':true,
        'inline': props.inline
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { useIcons } from '../../composables/mixins/useIcons'
const $t = useI18n().t
const icon = useIcons()

const props = defineProps({
  small: { type: Boolean, default: false} ,
  animation: { type: String, default: 'cylon' },
  color: { type: String, default: 'black' },
  inline: { type: Boolean, default: false },
})

</script>

<style scoped>
.ILoading {
  max-width: fit-content;
}
</style>

