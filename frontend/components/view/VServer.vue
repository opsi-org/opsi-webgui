<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <TableTTable
    ref="tableRef"
    :row-id="rowId"
    :is-mobile="isMobile"
    :table-column="tableColumn"
    :fetch="fetchServer"
    :action-config="(rowData: any) => `/servers/server/config/${rowData[rowId]}`"
    :sort-by="storeCookie.serversSorting.column"
    :sort-desc="storeCookie.serversSorting.isDesc"
    @selection-changed="(id: string) => {storeSelection.toggleSelectionDepots(id)}"
    @clear-selection="storeSelection.clearSelectionDepots"
  />
</template>

<script setup lang="tsx">
  import type { T_ServerList } from '~/types/APItypes'
  import { useNotification } from '~/composables/mixins/useComponent'
  import Checkbox from 'primevue/checkbox'
  import RadioButton from 'primevue/radiobutton'

  const { notifyError } = useNotification()
  const $t = useI18n().t

  const storeSelection = storeSelections()
  const storeCookie = storeTablesettings()

  const emit = defineEmits(['change'])
  const _props = defineProps({
    isMobile: {
      type: Boolean,
      default: () => {
        return useMQ().isMobile.value
      },
    },
  })

  const rowId = 'depotId'
  const tableRef = ref()
  const tableColumn = ref([
    {
      title: '',
      key: 'selected',
      sortable: 'custom',
      type: 'selection',
      visible: storeCookie.serversColumns.includes('selected'),
      alwaysVisible: true,
      width: '60px',
      cellRenderer: ({ rowData }: any) => {
        if (!rowData?.[rowId]) return
        rowData.selected = storeSelection.selectionDepots.includes(
          rowData[rowId],
        )
        watch(
          () => storeSelection.selectionDepots,
          () => {
            rowData.selected = storeSelection.selectionDepots.includes(
              rowData[rowId],
            )
          },
        )
        return storeSelection.multiSelection ? (
          <Checkbox model-value={rowData.selected} binary readonly />
        ) : (
          <RadioButton
            model-value={rowData.selected}
            inputId={rowId + 'Selection-' + rowData[rowId]}
            name={rowId + 'selection'}
            value=""
            binary
            readonly
          />
        )
      },
    },
    {
      title: $t('table.fields.id'),
      key: 'depotId',
      sortable: 'custom',
      visible: storeCookie.serversColumns.includes('depotId'),
      alwaysVisible: true,
      filter: true,
      cellRenderer: ({ rowData }: any) => {
        return (
          <>
            {rowData.type === 'OpsiConfigserver' ? (
              <el-text>
                {' '}
                <b>{rowData.depotId}</b>
              </el-text>
            ) : (
              <el-text>{rowData.depotId}</el-text>
            )}
          </>
        )
      },
    },
    {
      title: $t('table.fields.description'),
      key: 'description',
      sortable: 'custom',
      visible: storeCookie.serversColumns.includes('description'),
    },
    {
      title: $t('table.fields.type'),
      key: 'type',
      sortable: 'custom',
      visible: storeCookie.serversColumns.includes('type'),
      cellRenderer: ({ rowData }: any) => {
        return (
          <>
            {rowData.type === 'OpsiConfigserver' ? (
              <el-text>
                {' '}
                <b>{rowData.type}</b>
              </el-text>
            ) : (
              <el-text>{rowData.type}</el-text>
            )}
          </>
        )
      },
    },
    {
      title: $t('table.fields.ip'),
      key: 'ip',
      sortable: 'custom',
      visible: storeCookie.serversColumns.includes('ip'),
    },
    {
      title: $t('table.fields.rowactions'),
      key: 'actions',
      sortable: false,
      visible: storeCookie.serversColumns.includes('actions'),
      alwaysVisible: true,
      width: '150px',
    },
  ])

  watch(
    () => storeCookie.serversSorting,
    () => {
      refetch()
    },
    { deep: true },
  )

  function refetch() {
    tableRef.value?.refetch()
  }
  async function fetchServer(params: any) {
    if (params.sortBy === '') {
      params.sortBy = 'depotId'
    } else if (params.sortBy === 'selected') {
      params.selected = JSON.stringify(storeSelection.selectionDepots)
    }

    if (
      (params.sortBy && storeCookie.serversSorting.column != params.sortBy) ||
      params.sortDesc != (storeCookie.serversSorting.isDesc as boolean)
    ) {
      storeCookie.setSortColumn(
        'servers',
        params.sortBy,
        params.sortDesc as boolean,
      )
    }
    storeCookie.serversSorting.isDesc = params.sortDesc as boolean
    const { data, error, headers } = await useApiGETBody<T_ServerList>(
      '/opsidata/depots',
      params,
    )
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      return
    }
    if (data.value == undefined) {
      notifyError({
        message: $t('message.error.empty-response', { details: 'Servers' }),
      })
      return
    }
    if (params.sortBy !== 'selected') {
      const opsiconfigserver = storeCache().opsiconfigserver
      if (opsiconfigserver) {
        storeSelection.pushToSelectionDepots(opsiconfigserver)
        emit('change', opsiconfigserver)
      } else {
        storeSelection.pushToSelectionDepots(data.value[0].depotId)
        emit('change', data.value[0].depotId)
      }
    }
    for (const dId of storeSelection.selectionDepots) {
      data.value
        .filter((row: any) => {
          return row.depotId === dId
        })
        .forEach((row: any) => {
          row.selected = true
        })
    }
    return {
      data: data.value,
      total: parseInt(headers.get('x-total-count') || '0'),
    }
  }
</script>
