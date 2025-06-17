<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-select
    v-model="value"
    data-testid="host-select"
    clearable
    :placeholder="$t('--select--')"
    style="min-width: 200px"
  >
    <el-option
      v-for="item in fetchedData"
      :class="{ 'font-bold': specialIds.includes(item) }"
      :key="item"
      :label="item"
      :value="item"
    />
  </el-select>
</template>

<script setup lang="tsx">
  import type { PropTypeServerClient } from '~/types/tproptypes'
  import { useClient, useDepot } from '~/composables/mixins/useGet'
  const $t = useI18n().t
  const storeSel = storeSelections()
  const fetchedData = ref<Array<any>>([])
  const value = ref<string | undefined>()

  const props = defineProps({
    id: { type: String, default: undefined },
    type: {
      type: String as PropType<PropTypeServerClient>,
      default: 'servers',
    },
    specialIds: { type: Array<string>, default: [] },
    sync: { type: Boolean, default: false },
  })
  const emit = defineEmits(['update:value'])
  onMounted(async () => {
    await fetch()
    value.value = props.id || undefined
  })
  watch(
    () => props.id,
    () => {
      if (props.sync) {
        value.value = props.id
      }
    }
  )
  watch(
    () => value.value,
    () => {
      switch (useRoute().name) {
        // TODO: not push, replace.... otherwise logtype got lost
        case 'clients-config':
          useRouter().push({
            name: 'clients-config-id',
            params: { id: value.value as string },
          })
          break
        case 'servers-config':
          useRouter().push({
            name: 'servers-config-id',
            params: { id: value.value as string },
          })
          break
        case 'clients-config-id':
          useRouter().push({
            name: 'clients-config-id',
            params: { id: value.value as string },
          })
          break
        case 'clients-logs':
          useRouter().push({
            name: 'clients-logs-id',
            params: { id: value.value as string },
          })
          break
        case 'clients-logs-id':
          useRouter().push({
            name: 'clients-logs-id',
            params: { id: value.value as string },
          })
          break
        case 'servers-config-id':
          useRouter().push({
            name: 'servers-config-id',
            params: { id: value.value as string },
          })
          break

        default:
          break
      }

      emit('update:value', value.value)
    }
  )
  async function fetch() {
    if (props.type === 'servers') {
      const dataSorted = await useDepot($t).getDepotIdList()
      fetchedData.value = dataSorted
    } else if (props.type === 'clients') {
      const dataSorted = await useClient().getClientIdList(storeSel.selectionDepots)
      fetchedData.value = dataSorted
    }
  }
</script>
