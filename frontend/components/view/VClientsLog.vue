<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div>
    <el-form
      :inline="true"
      id="log-header-options"
      label-position="top"
      class="mt-0"
      v-loading="isLoading"
      size="small"
    >
      <el-form-item :label="$t('clientId')" v-if="!props.isChild">
        <SelectSHosts
          :type="type"
          @change="setId"
          :special-ids="selectionClients"
          :id="logrequest.selectedClient"
          :sync="syncSelection"
        />
      </el-form-item>
      <el-form-item :label="$t('logType')">
        <el-select v-model="logtype" style="min-width: 200px">
          <el-option v-for="lt in LOG_TYPES" :key="lt" :label="lt" :value="lt" />
        </el-select>
      </el-form-item>
      <template v-if="fetchedData.length > 1">
        <el-form-item :label="$t('filter')">
          <el-input
            v-model="filterQuery"
            clearable
            style="width: 200px"
            @input="filterLogByQuery"
          />
        </el-form-item>
        <br />
        <el-form-item :label="$t('logLevel')">
          <el-slider v-model="loglevel" show-stops :max="8" style="min-width: 200px" />
        </el-form-item>
        <el-form-item :label="$t('autoFetch')" class="!inline">
          <el-switch v-model="autofetch" class="!inline" />
        </el-form-item>
        <el-form-item :label="$t('autoScroll')" class="!inline">
          <el-switch
            v-model="autoscroll"
            class="!inline"
            :disabled="logConfig.logmarkerNr > -1 && logMarkerForThisSetting"
          />
        </el-form-item>
        <el-form-item
          :label="$t('rowMarker')"
          class="!inline !mb-0 !pb-0"
          :class="{
            '!hidden': logConfig.logmarkerNr <= -1 || !logMarkerForThisSetting,
          }"
        >
          <el-button
            :aria-label="$t('scrollToRowMarker')"
            :title="$t('scrollToRowMarker')"
            size="small"
            bg
            text
            type="primary"
            class="!m-0"
            @click="scrollToMarker"
          >
            <IconIIcon :icon="useIcons().bookmark" @click="scrollToMarker" />
          </el-button>
          <el-button
            @click="logConfig.setLogmarker(logConfig.logmarkerNr, logrequest.selectedClient)"
            size="small"
            type="primary"
            class="!m-0"
            text
            bg
            :aria-label="$t('removeRowMarker')"
            :title="$t('removeRowMarker')"
          >
            <IconIIcon
              :icon="useIcons().x"
              @click="logConfig.setLogmarker(-1, logrequest.selectedClient)"
            />
          </el-button>
        </el-form-item>

        <el-form-item :label="$t('actions')" class="!inline">
          <el-button @click="downloadCurrent" size="small" text bg>
            <IconIIcon
              :icon="useIcons().download"
              :aria-label="$t('downloadCurrent')"
              :title="$t('downloadCurrent')"
            />
          </el-button>
          <el-button @click="reload" size="small" text bg>
            <IconIIcon
              :icon="useIcons().refresh"
              :aria-label="$t('refresh')"
              :title="$t('refresh')"
            />
          </el-button>
        </el-form-item>
      </template>
      <el-form-item :label="$t('globalSelection')" class="!inline">
        <el-switch v-model="syncSelection" class="!inline" />
      </el-form-item>
    </el-form>

    <div
      :class="`overflow-scroll`"
      :style="`height: ${maxVisibleHeight}px; max-height: ${maxVisibleHeight}px`"
    >
      <div v-if="fetchedData.length > 1" class="whitespace-nowrap border-1 border-green-500">
        <div v-for="(log, i) in filteredDataByQuery" :key="log" :id="'logrow-' + i">
          <div
            :class="{
              logrow: true,
              hidden: !isLoglevelSmaller(log),
              [getColorBasedOnLoglevel(log)]: true,
              'flex max-w-fit text-sm w-full ': true,
            }"
          >
            <span class="min-w-4 mt-1" :id="'logrow-icon-' + i">
              <IconIIcon
                :icon="useIcons().bookmark"
                v-if="logConfig.logmarkerNr == i && logMarkerForThisSetting"
              />
            </span>
            <code class="!min-w-16 !w-16 sticky left-0 flex-none" @click="setMarker(i)">
              {{ $t('textInBrackets', { value: i }) }}
            </code>
            <code @click="setMarker(i)">
              {{ log }}
            </code>
            <br />
          </div>
        </div>
      </div>
      <el-alert v-else :title="$t('message.noLogsFound')" type="info" show-icon :closable="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { PropTypeServerClient } from '~/types/tproptypes'
  import type { T_ClientLog } from '~/types/APItypes'
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useMBus } from '~/composables/mixins/useMessagebus'
  import { useDynamicHeight } from '~/composables/mixins/useDynamicHeightWindow'

  const $t = useI18n().t
  const { notifyError, notifyInfo } = useNotification()
  const _msgbus = useMBus(wsBusMsgObjectChanged, false, $t, ['event:log_updated'])

  const settings = storeSettings()
  const logConfig = storeLogs()
  const { loglevel, logtype, autofetch, autoscroll, syncSelection } = storeToRefs(logConfig)
  const { selectionClients } = storeToRefs(storeSelections())

  const props = defineProps({
    id: { type: String, default: '' },
    type: {
      type: String as PropType<PropTypeServerClient>,
      default: 'clients',
    },
    isChild: { type: Boolean, default: false },
  })
  // does not have any effect. height restriction cames from upper components LDefault or LSplitView
  const { maxVisibleHeight } = useDynamicHeight(
    ['btop-header', 'globalBreadcrumb', 'log-header-options'],
    props.isChild ? 100 : 50
  )

  const fetchedData = ref<Array<string>>([])
  const filteredDataByQuery = ref<Array<string>>([])
  const isLoading = ref(false)
  const logrequest = {
    selectedClient:
      props.id?.length > 0
        ? props.id
        : selectionClients.value.length == 1
          ? selectionClients.value[0]
          : '',
    selectedLogType: 'instlog',
  }
  const filterQuery = ref('')

  const LOG_TYPES = ['bootimage', 'clientconnect', 'instlog', 'opsiconfd', 'userlogin']
  const COLORS_LIGHT = [
    '', // starts with 0, loglevel 1 is essential
    'text-opsi-log-light-essential',
    'text-opsi-log-light-critical',
    'text-opsi-log-light-error',
    'text-opsi-log-light-warning',
    'text-opsi-log-light-notice',
    'text-opsi-log-light-info',
    'text-opsi-log-light-debug',
    'text-opsi-log-light-trace',
    'text-opsi-log-light-secret',
  ]
  const COLORS_DARK = [
    '', // starts with 0, loglevel 1 is essential
    'text-opsi-log-dark-essential',
    'text-opsi-log-dark-critical',
    'text-opsi-log-dark-error',
    'text-opsi-log-dark-warning',
    'text-opsi-log-dark-notice',
    'text-opsi-log-dark-info',
    'text-opsi-log-dark-debug',
    'text-opsi-log-dark-trace',
    'text-opsi-log-dark-secret',
  ]

  const isDarkMode = computed({
    get: () => settings.colormode === 'dark',
    set: (value: boolean) => {
      settings.setColormode(value ? 'dark' : 'light')
    },
  })
  const logMarkerForThisSetting = computed<boolean>(() => {
    return (
      logConfig.logmarkerId === logrequest.selectedClient &&
      logConfig.logmarkerType === logtype.value
    )
  })

  onMounted(() => {
    if (props.id) {
      setId(props.id)
    }
  })

  watch([() => props.id, () => logtype], fetch, {
    immediate: true,
    deep: true,
  })
  watch(() => loglevel, reload, {
    immediate: true,
    deep: true,
  })
  watch(
    [() => selectionClients.value],
    () => {
      if (syncSelection.value) {
        setId(selectionClients.value.length >= 1 ? selectionClients.value[0] : '')
      }
    },
    {
      immediate: true,
      deep: true,
    }
  )
  watch(
    () => fetchedData.value,
    async () => {
      // wait 1 sec for rendering
      await new Promise((resolve) => setTimeout(resolve, 1000))
      if (autoscroll.value && logConfig.logmarkerNr === -1) {
        const items = document.querySelectorAll('.logrow:not(.hidden)')
        items[items.length - 1]?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        })
      }
    }
  )
  async function reload() {
    await fetch()
    scrollToMarker()
  }
  async function fetch() {
    if (!logrequest.selectedClient) {
      isLoading.value = false
      return
    }
    isLoading.value = true
    logrequest.selectedLogType = logtype.value
    try {
      const { data, error } = await useApiGETBody<T_ClientLog>(
        `/opsidata/log?selectedClient=${logrequest.selectedClient}&selectedLogType=${logrequest.selectedLogType}`
      )
      if (error) {
        return
      }
      if (data.value == undefined) {
        notifyError({
          message: $t('message.error.emptyResponse', {
            details: 'ClientsLog',
          }),
        })
        return
      }
      fetchedData.value = data.value.result
      if (!fetchedData.value) {
        notifyError({
          message: $t('message.error.emptyResponse', {
            details: 'ClientsLog',
          }),
        })
        return
      }
      filteredDataByQuery.value = fetchedData.value
    } catch (error) {
      notifyError({ message: error || $t('message.error.general') })
    } finally {
      isLoading.value = false
    }
  }

  function filterLogByQuery() {
    filteredDataByQuery.value = fetchedData.value.filter((log) => log.includes(filterQuery.value))
  }

  function isLoglevelSmaller(logrow: string) {
    const rxSelf2 = new RegExp('^((\\[[0-' + loglevel.value + ']\\])|[^\\[0-9\\]])', 'g')
    const result = RegExp(rxSelf2).exec(logrow)
    return !!result
  }

  function getColorBasedOnLoglevel(log: string) {
    const logLevel = parseInt(log.charAt(1), 10)
    return (isDarkMode.value ? COLORS_DARK[logLevel] : COLORS_LIGHT[logLevel]) || 'text-inherit'
  }

  function setId(id: string) {
    logrequest.selectedClient = id
  }
  function setMarker(i: number) {
    if (logConfig.logmarkerNr === i) {
      logConfig.setLogmarker(-1, logrequest.selectedClient)
      return
    }
    logConfig.setLogmarker(i, logrequest.selectedClient)
  }
  function scrollToMarker() {
    if (logConfig.logmarkerNr === -1) {
      return
    }
    scrollToAndHighlightRow(logConfig.logmarkerNr)
  }
  function scrollToAndHighlightRow(nr: number, duration = 2000) {
    const el = document.getElementById('logrow-' + nr)
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })

      el.classList.add('highlight')
      setTimeout(() => {
        el.classList.remove('highlight')
      }, duration)
    }
  }
  function downloadCurrent() {
    const fileName = `${logrequest.selectedClient}_${logtype.value}.log`
    const filteredByLoglevel = fetchedData.value.filter((log) => isLoglevelSmaller(log))

    const blob = new Blob([filteredByLoglevel.join('\n')], { type: 'text/txt' })
    const fileURL = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = fileURL
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(fileURL) // Clean up
  }

  async function wsBusMsgObjectChanged(msg: any = undefined) {
    if (
      msg &&
      _msgbus.channels.includes(msg.channel) &&
      msg.data.type === logtype.value &&
      msg.data.object_id === logrequest.selectedClient
    ) {
      if (autofetch.value) {
        fetch()
        return
      }
      notifyInfo({
        title: $t('opsiMessageBus'),
        message: $t('opsiMessageBus.log_updated'),
        button: {
          label: $t('reloadPage'),
          onClick: fetch,
        },
      })
    }
  }
</script>

<style scoped>
  :deep(.el-form-item) {
    margin-right: 10px !important;
  }
  :deep(.el-form-item > label),
  :deep(.el-form-item > .el-form-item__label) {
    margin-bottom: 0px !important;
  }

  .highlight {
    background-color: var(--el-color-primary); /* Hervorhebungsfarbe */
    -webkit-transition: background-color 1000ms ease-in;
    -moz-transition: background-color 1000ms ease-in;
    -o-transition: background-color 1000ms ease-in;
    -ms-transition: background-color 1000ms ease-in;
    transition: background-color 1000ms ease-in;
  }
</style>
