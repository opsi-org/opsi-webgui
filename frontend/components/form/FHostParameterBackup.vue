<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div data-testid="FHostParameter" class="">
    <el-alert v-if="showWarning" type="warning" show-icon>
      {{ $t('alert.select') }}
    </el-alert>
    <div class="overflow-y-auto" :style="`max-height: ${maxVisibleHeight}px;`">
      <el-collapse accordion v-loading="isLoading" @change="handleCollapseChange">
        <el-collapse-item v-for="(items, category) in fetchedData" :key="category" :name="category">
          <template #title>
            <strong>{{ String(category) }}</strong>
          </template>
          <template v-if="activeItem === category">
            <el-form
              label-width="50%"
              :label-position="mq.isMobile.value ? 'top' : 'left'"
              class="w-full"
            >
              <div v-for="item in items" :key="item.configId" class="form-item">
                <el-form-item>
                  <!-- <el-form-item :label="item.configId"> -->
                  <template #label>
                    <div class="flex w-full h-full justify-between items-center">
                      <span>{{
                        item.configId.startsWith(`${category}.`)
                          ? item.configId.replace(`${category}.`, '')
                          : item.configId
                      }}</span>
                      <p-badge
                        v-if="
                          !arrayEqual(itemValues[item.configId], initialValues[item.configId])
                          // itemValues[item.configId] !=
                          // initialValues[item.configId]
                        "
                        :title="
                          $t('message.warning.unsavedChange') +
                          ` <br> initial: ${initialValues[item.configId]}
                            <br> current: ${itemValues[item.configId]}`
                        "
                        severity="warn"
                        :value="t_fixed('notOrigin')"
                      />
                    </div>
                  </template>
                  <template v-if="item.type === 'BoolConfig'">
                    <el-checkbox
                      v-model="itemValues[item.configId]"
                      :disabled="config.read_only"
                      class="ml-2"
                      @change="handleSelection(item, itemValues[item.configId])"
                    />
                  </template>
                  <template v-else-if="item.type === 'UnicodeConfig'">
                    <div class="flex w-full">
                      <SelectSSelect
                        v-model:selection="itemValues[item.configId]"
                        v-model:data="item.possibleValues"
                        :editable="item.editable"
                        :multi-selection="item.multiValue"
                        :selected-options="itemValues[item.configId]"
                        :marked-options="initialValues[item.configId]"
                        :info-id="item.configId"
                        @change="() => handleSelection(item, itemValues[item.configId])"
                      />
                    </div>
                  </template>
                </el-form-item>
              </div>
            </el-form>
          </template>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div
      v-if="fetchedData && Object.keys(fetchedData).length > 0 && !config.read_only"
      class="button-container"
      style="display: flex; justify-content: flex-end"
    >
      <!-- TODO: enable if save if method is implemented (#763) -->
      <el-button @click="createConfigVisible = !createConfigVisible" class="!hidden">{{
        $t('button.create.config')
      }}</el-button>
      <el-button @click="fetchFormData">{{ $t('button.reset') }}</el-button>
      <el-button
        :type="hasUnsavedChanges ? 'success' : ''"
        :disabled="!hasUnsavedChanges"
        @click="saveHostParameters"
        >{{ $t('button.save') }}</el-button
      >
    </div>
    <ModalMConfigCreation v-if="createConfigVisible" class="!hidden" @refetch="() => {}" />
  </div>
</template>

<script setup lang="ts">
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useMBus } from '~/composables/mixins/useMessagebus'
  import { useSaveParameters } from '~/composables/mixins/useSave'
  import type { T_HostParameter } from '~/types/APItypes'
  import type { PropTypeServerClient } from '~/types/tproptypes'
  import { onBeforeRouteLeave } from 'vue-router'
  import type { CollapseModelValue } from 'element-plus'
  import { useStrings } from '~/composables/mixins/useStrings'
  import { useDynamicHeight } from '~/composables/mixins/useDynamicHeightWindow'

  const { notifyError, notifyInfo } = useNotification()
  const t_fixed = useStrings().t_fixed
  const $t = useI18n().t
  const mq = useMQ()
  const config = storeConfigapp().config ?? { read_only: true }
  const isLoading = ref(false)
  const fetchedData = ref<T_HostParameter | undefined>()
  const itemValues = ref<{ [key: string]: any }>({})
  const initialValues = ref<{ [key: string]: any }>({})
  const hasUnsavedChanges = ref(false)
  const changeBuffer = ref<{ [key: string]: any }>({})
  const activeItem = ref<string | null>(null)
  const createConfigVisible = ref(false)

  const props = defineProps({
    id: { type: String, default: undefined },
    type: {
      type: String as PropType<PropTypeServerClient>,
      default: 'servers',
    },
    isChild: { type: Boolean, default: false },
  })
  const { maxVisibleHeight } = useDynamicHeight(
    [
      'btop-header',
      'globalBreadcrumb',
      'config-pre-tabs',
      // 'tableHeader-'+props.tableId
      // 'tableFooter-'+props.tableId
    ],
    50
  )

  const showWarning = computed(() => {
    return !(props.type === 'servers' || props.id)
  })

  function handleCollapseChange(activeNames: CollapseModelValue) {
    activeItem.value = Array.isArray(activeNames) ? String(activeNames[0]) : String(activeNames)
  }
  function getInitialValue(item: {
    configId: string
    type: 'BoolConfig' | 'UnicodeConfig'
    value?: any
    objects?: Record<string, any>
    multiValue?: boolean
  }): any {
    if (item.value !== undefined) return item.value

    if (item.objects && Object.keys(item.objects).length > 0) {
      const objectValues = Object.values(item.objects) // e.g. [true, true, true] or with multiValue [[true], [true], [true]]

      if (item.multiValue) {
        // erstmal egal
        const sortedValues = objectValues.map((value: any) => JSON.stringify([...value].sort()))
        if (sortedValues.every((v: string) => v === sortedValues[0])) {
          return objectValues[0]
        }
        return 'mixed'
      }
      if (objectValues.every((v: any) => v === objectValues[0])) {
        // not multi!
        // all values are the same
        if (item.type == 'BoolConfig' && objectValues[0] !== undefined) {
          // value is given
          return objectValues[0]
        } else if (item.type == 'UnicodeConfig') {
          if (isArray(objectValues[0])) return objectValues[0][0]
          return objectValues[0]
        }
        // value not given
        if (item.type === 'BoolConfig') return undefined
        else if (item.multiValue) return []
        else return ''
      }
    }
    throw new Error('Initial value is undefined and no valid objects found')
  }

  async function fetchFormData() {
    if (props.type === 'servers' || props.id) await fetch()
    if (fetchedData.value) {
      for (const category in fetchedData.value) {
        fetchedData.value[category].forEach((item: any) => {
          const initialValue = getInitialValue(item)
          itemValues.value[item.configId] = initialValue
          initialValues.value[item.configId] = initialValue
        })
      }
    }
    hasUnsavedChanges.value = false
  }

  onMounted(fetchFormData)

  watch(() => props.id, fetchFormData)

  const channels = [
    'event:config_created',
    'event:config_updated',
    'event:config_deleted',
    'event:configState_created',
    'event:configState_updated',
    'event:configState_deleted',
  ]
  const _msgbus = useMBus(wsBusMsgObjectChanged, false, $t, channels)

  async function wsBusMsgObjectChanged(msg: any = undefined) {
    if (msg && channels.includes(msg.channel)) {
      notifyInfo({
        title: $t('message.info.event'),
        message: $t('message.info.event.config_updated', {
          configId: msg.data.configId,
        }),
        button: { label: $t('label.reloadPage'), onClick: fetch },
      })
    }
  }

  async function fetch() {
    isLoading.value = true
    let endpoint = ''
    if (props.type === 'clients' || (props.type === 'servers' && props.id)) {
      endpoint = `/opsidata/config/objects/${props.id}`
    } else if (props.type === 'servers') {
      endpoint = '/opsidata/config'
    } else {
      console.error('not defined')
    }
    await fetchHostParameters(endpoint)
    isLoading.value = false
  }

  async function fetchHostParameters(endpoint: string) {
    const { data, error } = await useApiGETBody<T_HostParameter>(endpoint)
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      return
    }
    fetchedData.value = data.value
  }

  function handleSelection(item: any, value: any) {
    assert(value !== undefined, `values should not be undefined (${item.configId}, ${value})`)
    assert(
      itemValues.value[item.configId] !== undefined,
      `itemValues should not be undefined (${item.configId}, ${value})`
    )
    assert(
      initialValues.value[item.configId] !== undefined,
      `initialValues should not be undefined (${item.configId}, ${value})`
    )
    changeBuffer.value[item.configId] = JSON.parse(JSON.stringify(value))
    checkUnsavedChanges()
  }

  function checkUnsavedChanges() {
    hasUnsavedChanges.value = Object.keys(itemValues.value).some((key) => {
      if (itemValues.value[key] === undefined) return false
      if (isArray(itemValues.value[key]) && isArray(initialValues.value[key])) {
        if (initialValues.value[key] === itemValues.value[key]) return false
        // check arrays deeply (e.g. they have just another value order)
        return !arrayEqual(initialValues.value[key], itemValues.value[key])
      }
      return itemValues.value[key] !== initialValues.value[key]
    })
  }

  async function saveHostParameters() {
    isLoading.value = true
    let url = ''
    let request: any = []

    if (props.type === 'servers' && !props.id) {
      url = '/opsidata/config'
      request = Object.keys(changeBuffer.value).map((configId) => ({
        configId,
        value: String(changeBuffer.value[configId]),
      }))
    } else if (props.type === 'clients' || props.type === 'servers') {
      url = '/opsidata/config/objects'
      request = {
        objectIds: [props.id as string],
        configs: Object.keys(changeBuffer.value).map((configId) => ({
          configId,
          value: String(changeBuffer.value[configId]),
        })),
      }
    } else {
      console.error('not defined')
    }

    await useSaveParameters($t).saveParameters(url, request, null, true)

    isLoading.value = false
    hasUnsavedChanges.value = false
    changeBuffer.value = {}
    initialValues.value = { ...itemValues.value }
  }

  onBeforeRouteLeave((to, from, next) => {
    if (hasUnsavedChanges.value) {
      const answer = window.confirm($t('message.warning.unsavedChanges'))
      if (answer) {
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  })
</script>

<style scoped lang="css">
  :deep(.el-form-item__label) {
    height: auto !important;
  }
</style>
