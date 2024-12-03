<template>
  <el-card body-class="p-0 max-h-72 overflow-y-auto" shadow="always">
    <ul>
      <li v-for="c in [id, ...selection].toSorted()" :key="c" class="p-0">
        <el-button
          class="text-small"
          variant="outline-primary"
          size="small"
          :title="$t('button.delete')"
          @click="emit('selectionDelete', c)"
          ><IconIIcon :icon="icons.delete"
        /></el-button>
        {{ c }}
      </li>
    </ul>
  </el-card>
</template>

<script lang="ts" setup>
  import { useIcons } from '~/composables/mixins/useIcons'
  const icons = useIcons()
  const $t = useI18n().t
  const emit = defineEmits(['selectionDelete'])
  const _props = defineProps({
    id: { type: String, default: '' },
    selection: { type: Array as PropType<Array<string>>, default: () => [] },
  })
</script>
