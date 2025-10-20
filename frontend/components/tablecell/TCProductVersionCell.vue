<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <TooltipTTooltip data-testid="TCProductVersionCell">
    <template #default>
      <el-text>{{ rowitem.depot_version_diff ? ' ' : rowitem.depotVersions?.[0] }}</el-text>
      <IconIDetails
        v-if="rowitem.depot_version_diff"
        class="details depot-unequal"
        content="depot-unequal"
        :variant="rowitem.depot_version_diff || false ? 'warn' : undefined"
      />
      <IconIDetails
        v-if="rowitem.selectedDepots?.length !== selectionDepots.length"
        :variant="rowitem.selectedDepots?.length !== selectionDepots.length ? 'warn' : undefined"
        class="details depot-wo-prod"
        content="depot-wo-prod"
      />
      <IconIDetails
        v-if="
          rowitem.installationStatus !== 'not_installed' &&
          (rowitem.client_version_outdated || false)
        "
        :variant="rowitem.client_version_outdated || false ? 'danger' : undefined"
        class="details client-outdated"
        content="client-outdated"
      />
    </template>
    <template #tooltip>
      <div v-for="(hosts, server, index) in tooltiptext" :key="server">
        <span
          v-for="(version, host) in hosts"
          :key="host"
          class="w-full !flex !justify-between"
          :class="[
            host == server ? '' : 'pl-4',
            host !== server && !openedTTServer.includes(index) ? '!hidden' : '',
            Object.keys(hosts || {}).length > 1 ? '' : '',
          ]"
          @click="toggleTTRow(index, host, server, hosts)"
        >
          <!-- if row is server row. we allow to click and show an icon if its collapsed -->
          <IconIIcon
            v-if="host === server && Object.keys(hosts).length > 1"
            class="mr-1 mt-1"
            :icon="openedTTServer.includes(index) ? icons.arrowRight : icons.arrowDown"
          />
          <p class="text-left w-full">{{ host }}</p>
          <!-- if any child of the server is outdated, we show an unequal sign -->
          <p
            v-if="
              host == server &&
              Object.values(hosts).some((v) => v !== NOVERSION && v != tooltiptext[server][server])
            "
            class="text-left mr-2 text-danger"
          >
            {{ t_fixed('unequal') }}
          </p>

          <!-- each host has a version (even if its empty '--') -->
          <p-tag
            :pt:root:class="[
              'm-0 p-0 min-w-28',
              version !== NOVERSION && version !== tooltiptext[server][server] ? 'bg-danger' : '',
            ]"
          >
            {{ version }}
          </p-tag>
        </span>
      </div>
    </template>
  </TooltipTTooltip>
</template>

<script setup lang="ts">
  import { useStrings } from '~/composables/mixins/useStrings'
  import { mapValues2Objects } from '~/utils/smappings'
  import type { T_Client2Depot, T_ProductRow } from '~/types/APItypes'
  import type { IObjectString2String, IObjectString2ObjectString2String } from '~/types/tgeneral'

  const NOVERSION = '--'
  const icons = useIcons()
  const { t_fixed } = useStrings()
  const { selectionDepots } = storeToRefs(storeSelections())

  const props = defineProps({
    row: { type: Object as PropType<T_ProductRow>, required: true },
    type: { type: String, required: true },
    selectedClients: { type: Array as PropType<string[]>, required: true },
    /*selectedDepots: {
      type: Array as PropType<string[]>,
      default: () => storeToRefs(storeSelections()).selectionDepots,
    },*/
    clients2depots: {
      type: Object as PropType<T_Client2Depot>,
      required: true,
    },
  })
  const openedTTServer = ref<number[]>([])
  const rowitem = computed(() => props.row)

  const tooltiptext = computed(() => {
    if (Object.keys(rowitem.value || {}).length <= 0) {
      return {}
    }

    const tt: IObjectString2ObjectString2String = {}

    if (rowitem.value.depotVersions) {
      const depots: IObjectString2String = mapValues2Objects(
        rowitem.value.depotVersions,
        rowitem.value.selectedDepots,
        selectionDepots.value,
        NOVERSION
      )

      for (const d in depots) {
        tt[d] = {
          [d]: depots[d],
        }
      }
    }
    if (
      Object.keys(props.clients2depots).length <= 0 ||
      Object.keys(props.clients2depots).length !== props.selectedClients.length
    ) {
      return tt
    }

    if (rowitem.value.clientVersions) {
      const clients: IObjectString2String = mapValues2Objects(
        rowitem.value.clientVersions,
        rowitem.value.selectedClients,
        props.selectedClients,
        NOVERSION
      )

      for (const c in clients) {
        const client = clients[c]

        const client2depot = props.clients2depots[c]

        tt[client2depot][c] = client
      }
    }

    return tt
  })

  if (Object.keys(tooltiptext.value).length == 1) {
    openedTTServer.value = [0]
  }

  function toggleTTRow(index: number, host: string | number, server: string | number, hosts: any) {
    if (hosts == undefined) return
    if (host != server || Object.keys(hosts || {})?.length <= 1) return

    if (openedTTServer.value?.includes(index)) {
      openedTTServer.value = openedTTServer.value.filter((i) => i !== index)
    } else {
      openedTTServer.value = [...(openedTTServer.value || []), index]
    }
  }
</script>
