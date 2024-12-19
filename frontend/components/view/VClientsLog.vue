<template>
  <el-form
    :inline="true"
    label-position="top"
    class="mt-0"
    v-loading="isLoading"
    size="small"
  >
    <el-form-item :label="$t('form.clientId')" v-if="!props.isChild">
      <SelectSHosts
        :type="type"
        @change="setId"
        :id="logrequest.selectedClient"
      />
    </el-form-item>
    <el-form-item :label="$t('form.logtype')">
      <el-select v-model="logtype" style="min-width: 200px">
        <el-option v-for="lt in logTypes" :key="lt" :label="lt" :value="lt" />
      </el-select>
    </el-form-item>
    <template v-if="fetchedData.length > 1">
      <el-form-item :label="$t('form.filter.logs')">
        <el-input
          v-model="filterQuery"
          clearable
          style="width: 200px"
          @input="filterLogByQuery"
        />
      </el-form-item>
      <el-form-item :label="$t('form.loglevel')">
        <el-slider
          v-model="loglevel"
          show-stops
          :max="8"
          style="min-width: 200px"
        />
      </el-form-item>
      <el-form-item :label="$t('form.autofetch')" class="!inline">
        <el-switch v-model="autofetch" class="!inline" />
      </el-form-item>
      <el-form-item :label="$t('form.autoscroll')" class="!inline">
        <el-switch v-model="autoscroll" class="!inline" />
      </el-form-item>
    </template>
  </el-form>
  <el-scrollbar ref="scrollElementRef" height="calc(100vh - 270px)">
    <div v-if="fetchedData.length > 1">
      <span
        v-for="(log, i) in filteredData"
        :key="log"
        :id="'logrow-' + i"
        :class="{
          logrow: true,
          hidden: !isLoglevelSmaller(log),
          [getColorBasedOnLoglevel(log)]: true,
        }"
      >
        <code>{{ log }} <br /></code>
      </span>
    </div>
    <el-alert
      v-else
      :title="$t('message.info.nologs')"
      type="info"
      show-icon
      :closable="false"
    />
  </el-scrollbar>
</template>

<script setup lang="ts">
  import type { PropTypeServerClient } from '~/types/tproptypes'
  import type { T_ClientLog } from '~/types/APItypes'
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useMBus } from '~/composables/mixins/useMessagebus'

  const { notifyError, notifyInfo } = useNotification()
  const $t = useI18n().t
  const settings = storeSettings()

  const _msgbus = useMBus(wsBusMsgObjectChanged, false, $t, [
    'event:log_updated',
  ])

  const props = defineProps({
    id: { type: String, default: '' },
    type: {
      type: String as PropType<PropTypeServerClient>,
      default: 'clients',
    },
    isChild: { type: Boolean, default: false },
  })

  const fetchedData = ref<Array<string>>([])
  const filteredData = ref<Array<string>>([])
  const isLoading = ref(false)
  const logrequest = { selectedClient: props.id, selectedLogType: 'instlog' }
  const logTypes = [
    'bootimage',
    'clientconnect',
    'instlog',
    'opsiconfd',
    'userlogin',
  ]
  const loglevel = ref(5)
  const logtype = ref('instlog')
  const filterQuery = ref('')
  const autofetch = ref(true)
  const autoscroll = ref(true)
  const scrollElementRef = ref<any>(null)

  const COLORS_LIGHT = [
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

  watch([() => props.id, () => logtype, loglevel], fetch, {
    immediate: true,
    deep: true,
  })
  watch(
    () => fetchedData.value,
    async () => {
      // wait 1 sec for rendering
      await new Promise((resolve) => setTimeout(resolve, 1000))
      if (autoscroll.value) {
        // scrollToLastItem()
        const items = document.querySelectorAll('.logrow:not(.hidden)')
        items[items.length - 1]?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        })
      }
    },
  )

  const isDarkMode = computed({
    get: () => settings.colormode === 'dark',
    set: (value: boolean) => {
      settings.setColormode(value ? 'dark' : 'light')
    },
  })

  async function fetch() {
    if (!logrequest.selectedClient) {
      isLoading.value = false
      return
    }
    isLoading.value = true
    logrequest.selectedLogType = logtype.value
    try {
      const { data, error } = await useApiGETBody<T_ClientLog>(
        `/opsidata/log?selectedClient=${logrequest.selectedClient}&selectedLogType=${logrequest.selectedLogType}`,
      )
      if (error) {
        notifyError({
          message:
            error?.response?.data?.message || $t('message.error.generic'),
        })
        return
      }
      if (data.value == undefined) {
        notifyError({
          message: $t('message.error.empty-response', {
            details: 'ClientsLog',
          }),
        })
        return
      }
      fetchedData.value = data.value.result
      filteredData.value = fetchedData.value
    } catch (error) {
      notifyError({ message: error || $t('message.error.unexpected') })
    } finally {
      isLoading.value = false
    }
  }

  function filterLogByQuery() {
    filteredData.value = fetchedData.value.filter((log) =>
      log.includes(filterQuery.value),
    )
  }

  function isLoglevelSmaller(logrow: string) {
    const rxSelf2 = new RegExp(
      '^((\\[[0-' + loglevel.value + ']\\])|[^\\[0-9\\]])',
      'g',
    )
    const result = RegExp(rxSelf2).exec(logrow)
    return !!result
  }

  function getColorBasedOnLoglevel(log: string) {
    const logLevel = parseInt(log.charAt(1), 10)
    return (
      (isDarkMode.value ? COLORS_DARK[logLevel] : COLORS_LIGHT[logLevel]) ||
      'text-inherit'
    )
  }

  function setId(id: string) {
    logrequest.selectedClient = id
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
        title: $t('message.info.event'),
        message: $t('message.info.event.log_updated'),
        button: {
          label: $t('label.reloadPage'),
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
  :deep(.el-form-item > label) {
    margin-bottom: 0px !important;
  }
</style>
