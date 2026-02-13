<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div data-testid="IDetails" :class="content" class="IDetails inline">
    <p-tag :severity="props.variant" size="small" class="pt-0 pb-0">
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
      <span v-else-if="props.contentIsIcon">
        <IconIIcon :icon="props.content" class="inline" />
      </span>
      <el-text v-else class="h6"
        >{{ props.content === 'unequal' ? t_fixed('unequal') : props.content }}
      </el-text>
    </p-tag>
  </div>
</template>

<script setup lang="ts">
  import { useStrings } from '~/composables/mixins/useStrings'
  import type { PSeverity } from '~/types/LibComponentTypes'

  const props = defineProps({
    text: { type: String, default: '' },
    content: { type: String, default: '*' },
    variant: { type: String as PropType<PSeverity>, default: 'warning' },
    contentIsIcon: { type: Boolean, default: false },
  })

  const icons = useIcons()
  const { t_fixed } = useStrings()
</script>
