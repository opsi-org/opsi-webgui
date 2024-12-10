<template>
  <div data-testid="IDetails" :class="'IDetails ' + content" class="inline">
    <el-tag :type="props.variant" size="small">
      <span v-if="props.content == 'depot-unequal'" class="inline">
        <el-text>{{ props.text ? props.text : t_fixed('unequal') }}</el-text>
        <IconIIcon :icon="icons.depots" size="small" class="inline" />
      </span>
      <span v-else-if="props.content == 'depot-wo-prod'" class="h6">
        <el-text>{{ t_fixed('notOrigin') }} </el-text>
        <IconIIcon :icon="icons.depots" class="inline" />
      </span>
      <span v-else-if="props.content == 'client-outdated'" class="h6">
        <el-text>{{ props.text ? props.text : t_fixed('unequal') }}</el-text>
        <IconIIcon :icon="icons.client" class="inline" />
      </span>
      <span v-else-if="props.content == 'ppv-client-different'" class="h6">
        <el-text>{{ props.text ? props.text : t_fixed('unequal') }}</el-text>
        <IconIIcon :icon="icons.client" class="inline" />
      </span>
      <span v-else-if="props.content == 'ppid-not-exists-on-depot'" class="h6">
        <el-text>{{ t_fixed('unequal') }} </el-text>
        <IconIIcon :icon="icons.depots" class="inline" />
      </span>
      <el-text v-else class="h6"
        >{{ props.content === 'unequal' ? t_fixed('unequal') : props.content }}
      </el-text>
    </el-tag>
  </div>
</template>

<script setup lang="ts">
  import { useIcons } from '~/composables/mixins/useIcons'
  import { useStrings } from '~/composables/mixins/useStrings'
  import type { ElTypeVariant } from '~/types/LibComponentTypes'

  const props = defineProps({
    text: { type: String, default: '' },
    content: { type: String, default: '*' },
    variant: { type: String as PropType<ElTypeVariant>, default: 'warning' },
  })

  const icons = useIcons()
  const { t_fixed } = useStrings()
</script>
