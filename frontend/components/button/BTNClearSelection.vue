<template>
  <el-button
    data-testid="BTNClearSelection"
    :aria-label="$t('table.selection.clear')"
    :title="props.showLabel ? '' : $t('table.selection.clear')"
    type="primary"
    plain
    class="ml-0"
    :class="{ 'is-fullwidth': props.short !== false }"
    size="small"
    @click="click"
  >
    <IconIIcon :icon="icons.clear" />
    <span v-if="props.showLabel == true">{{ props.label ? props.label : $t('table.selection.clear') }}</span>
    <span class="sr-only">{{ $t('table.selection.clear') }}</span>
  </el-button>
</template>

<script setup lang="ts">
  import { useIcons } from '~/composables/mixins/useIcons'
  const icons = useIcons()
  const props = defineProps({
    label: { type: String, default: '' },
    showLabel: { type: Boolean, default: false },
    short: { type: Boolean, default: true },
  })

  const click = () => {
    $emit('clearselection')
  }

  const $emit = defineEmits(['clearselection'])
</script>
