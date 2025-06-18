<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div id="config-pre-tabs">
    <SelectSHosts v-if="!props.isChild" :id="currentId" :type="type" @change="setId" />
    <!-- reload data -->
    <el-button @click="refetch" :title="$t('reload')">
      <IconIIcon :icon="useIcons().refetch" />
    </el-button>
  </div>
  <el-tabs v-model="activeName">
    <el-tab-pane
      :label="currentId ? $t('parameters') : $t('parameters(default)')"
      name="config"
      :disabled="!(type === 'clients' || type === 'servers')"
    >
      <FormFHostParameter
        ref="refHostParam"
        v-if="activeName === 'config'"
        :id="currentId"
        :type="type"
        :is-child="props.isChild"
      />
    </el-tab-pane>
    <el-tab-pane :label="$t('attributes')" name="attr" :disabled="isIdEmpty">
      <FormFHostAttributes
        ref="refHostAttr"
        v-if="activeName === 'attr'"
        :id="currentId"
        :type="type"
        :is-child="props.isChild"
      />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
  import type { PropTypeServerClient } from '~/types/tproptypes'

  const tableSettings = storeTablesettings()
  const { configLastSelected } = storeToRefs(tableSettings)
  const $t = useI18n().t
  const refHostParam = ref<any>(null)
  const refHostAttr = ref<any>(null)

  const props = defineProps({
    id: { type: String, default: undefined },
    type: {
      type: String as PropType<PropTypeServerClient>,
      default: 'servers',
    },
    isChild: { type: Boolean, default: false },
  })

  const currentId = ref<string | undefined>(props.id)
  const activeName = ref(configLastSelected.value[props.type] || 'config')

  watch(
    () => props.id,
    (newId) => {
      currentId.value = newId
      if (isIdEmpty.value && activeName.value !== 'config') {
        activeName.value = 'config'
      }
    }
  )

  watch(
    () => activeName.value,
    (newActiveName) => {
      tableSettings.setConfigLastSelected(props.type, newActiveName)
    }
  )

  const isIdEmpty = computed(() => !currentId.value)

  function refetch() {
    if (activeName.value === 'config') {
      refHostParam?.value?.refetch()
    } else if (activeName.value === 'attr') {
      refHostAttr?.value?.refetch()
    }
  }

  function setId(id: string) {
    currentId.value = id
  }
</script>
