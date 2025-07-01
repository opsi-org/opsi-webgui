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
      {{ $t('message.selectItem') }}
    </el-alert>
    <el-alert v-if="config.read_only" type="warning" show-icon>
      {{ $t('message.readOnlyActive') }}
    </el-alert>
    <el-alert v-if="!config.server_write_access" type="warning" show-icon>
      {{ $t('message.serverWriteAccessDisabled') }}
    </el-alert>
    <div class="overflow-y-auto tree-table-container" :style="`max-height: ${maxVisibleHeight}px;`">
      <p-tree-table
        ref="configTree"
        :value="fetchedData"
        size="small"
        :auto-layout="true"
        column-resize-mode="fit"
        :class="mq.isMobile.value ? 'text-xs' : ''"
        :expanded-keys="expandedKeys"
      >
        <p-column
          field="key"
          header=""
          expander
          class="!max-w-min !w-max border-y-[1px]"
          style="border-color: var(--el-border-color-light)"
        >
          <template #body="slotProps">
            <div
              class="block"
              @click="() => setExpandedRow(slotProps.node)"
              @contextmenu="(e) => onRightClick(e, slotProps.node?.data || {})"
              aria-haspopup="true"
            >
              <span v-if="slotProps.node.label == slotProps.node.key" class="w-full">{{
                slotProps.node.label.replaceAll('.', ' / ')
              }}</span>
              <TooltipTTooltip v-else>
                <span> {{ slotProps.node.label.replaceAll('.', ' / ') }}</span>
                <template #tooltip>
                  <span>{{ slotProps.node.key }}</span> <br />
                  <!--<pre> {{ slotProps.node }}</pre>-->
                </template>
              </TooltipTTooltip>

              <div
                v-if="mq.isMobile.value && slotProps.node.data?.type !== undefined"
                style="max-width: calc(100vw - 110px); width: calc(100vw - 110px)"
              >
                <p-badge
                  v-if="
                    (slotProps.node.data?.type == 'UnicodeConfig' &&
                      !arrayEqual(
                        itemValues[slotProps.node.key],
                        initialValues[slotProps.node.key]
                      )) ||
                    (slotProps.node.data?.type == 'BoolConfig' &&
                      itemValues[slotProps.node.key] != initialValues[slotProps.node.key])
                  "
                  :title="
                    $t('message.unsavedChangesWithValueinBold') +
                    `\n initial: ${initialValues[slotProps.node.key]} \n current: ${itemValues[slotProps.node.key]}`
                  "
                  severity="warn"
                  :value="t_fixed('notOrigin')"
                />
                <!-- BOOL CONFIG -->
                <p-checkbox
                  v-if="slotProps.node.data.type === 'BoolConfig'"
                  v-model="itemValues[slotProps.node.data.configId]"
                  class="ml-2 w-full"
                  :class="mq.isMobile.value ? 'flex flex-row-reverse pr-3' : ''"
                  :disabled="config.read_only || !config.server_write_access"
                  @change="
                    handleSelection(slotProps.node.data, itemValues[slotProps.node.data.configId])
                  "
                />
                <!-- UNICODE CONFIG -->
                <div v-else-if="slotProps.node.data.type === 'UnicodeConfig'">
                  <SelectSSelect
                    :info-id="slotProps.node.data.configId"
                    :disabled="config.read_only || !config.server_write_access"
                    :editable="slotProps.node.data.editable"
                    :multi-selection="slotProps.node.data.multiValue"
                    v-model:data="slotProps.node.data.possibleValues"
                    v-model:selection="itemValues[slotProps.node.data.configId]"
                    :selected-options="itemValues[slotProps.node.data.configId]"
                    :marked-options="initialValues[slotProps.node.data.configId]"
                    @change="
                      () =>
                        handleSelection(
                          slotProps.node.data,
                          itemValues[slotProps.node.data.configId]
                        )
                    "
                  />
                </div>
              </div>
            </div>
          </template>
        </p-column>
        <!-- column has changes -->
        <p-column
          v-if="!mq.isMobile.value"
          field="data"
          header=""
          class="!max-w-5 !w-5 border-y-[1px]"
          style="border-color: var(--el-border-color-light)"
        >
          <template #body="slotProps">
            <div v-if="slotProps.node.data?.type !== undefined">
              <p-badge
                v-if="
                  (slotProps.node.data?.type == 'UnicodeConfig' &&
                    !arrayEqual(
                      itemValues[slotProps.node.key],
                      initialValues[slotProps.node.key]
                    )) ||
                  (slotProps.node.data?.type == 'BoolConfig' &&
                    itemValues[slotProps.node.key] != initialValues[slotProps.node.key])
                "
                :title="
                  $t('message.unsavedChanges') +
                  `\n initial: ${initialValues[slotProps.node.key]} \n current: ${itemValues[slotProps.node.key]}`
                "
                severity="warn"
                :value="t_fixed('notOrigin')"
              />
            </div>
          </template>
        </p-column>
        <!-- Column value -->
        <p-column
          v-if="!mq.isMobile.value"
          field="label"
          header=""
          class="!min-w-1/2 !w-1/2 !max-w-[40vw] border-y-[1px]"
          style="border-color: var(--el-border-color-light)"
        >
          <template #body="slotProps">
            <div v-if="slotProps.node.data?.type !== undefined" class="w-full min-w-full flex">
              <!-- BOOL CONFIG -->
              <p-checkbox
                v-if="slotProps.node.data.type === 'BoolConfig'"
                v-model="itemValues[slotProps.node.data.configId]"
                :disabled="config.read_only || !config.server_write_access"
                class="ml-2 w-full"
                :class="mq.isMobile.value ? 'flex flex-row-reverse pr-3' : ''"
                @change="
                  handleSelection(slotProps.node.data, itemValues[slotProps.node.data.configId])
                "
              />
              <!-- UNICODE CONFIG -->
              <div class="flex w-full" v-else-if="slotProps.node.data.type === 'UnicodeConfig'">
                <SelectSSelect
                  v-model:selection="itemValues[slotProps.node.data.configId]"
                  v-model:data="slotProps.node.data.possibleValues"
                  :editable="slotProps.node.data.editable"
                  :multi-selection="slotProps.node.data.multiValue"
                  :selected-options="itemValues[slotProps.node.data.configId]"
                  :marked-options="initialValues[slotProps.node.data.configId]"
                  :info-id="slotProps.node.data.configId"
                  :disabled="config.read_only || !config.server_write_access"
                  @change="
                    () =>
                      handleSelection(slotProps.node.data, itemValues[slotProps.node.data.configId])
                  "
                />
              </div>
            </div>
          </template>
        </p-column>
      </p-tree-table>
    </div>
    <div
      v-if="fetchedData && Object.keys(fetchedData).length > 0 && !config.read_only"
      class="button-container"
      style="display: flex; justify-content: flex-end"
    >
      <!-- TODO: enable if save if method is implemented (#763) -->
      <el-button
        v-if="isGeneralDefault"
        @click="() => openCreationModal()"
        :aria-controls="createConfigVisible ? 'dlg' : null"
        :aria-expanded="createConfigVisible ? true : false"
        >{{ $t('addNew') }}</el-button
      >

      <el-button @click="fetchFormData">{{ $t('reset') }}</el-button>
      <el-button
        :type="hasUnsavedChanges ? 'success' : ''"
        :disabled="!hasUnsavedChanges"
        @click="saveHostParameters"
        >{{ $t('save') }}</el-button
      >
    </div>
    <ModalMConfigCreation
      v-if="createConfigVisible"
      v-model:visible="createConfigVisible"
      :default-item="lastCMItem"
      class="!hidden"
      @refetch="fetchFormData"
    />

    <p-context-menu ref="routemenu" :model="items" v-if="isGeneralDefault">
      <!--<template #item="{ item, props }">-->
      <template #item="cdata">
        <router-link
          v-if="cdata.item.route"
          v-slot="{ href, navigate }"
          :to="cdata.item.route"
          custom
        >
          <a v-ripple :href="href" v-bind="cdata.props.action" @click="navigate">
            <span :class="cdata.item.icon" />
            <span class="ml-2">{{ cdata.item.label }}</span>
          </a>
        </router-link>
        <a
          v-else
          v-ripple
          :href="cdata.item.url"
          :target="cdata.item.target"
          v-bind="cdata.props.action"
        >
          <span :class="cdata.item.icon" />
          <span class="ml-2">{{ cdata.item.label }}</span>
        </a>
      </template>
    </p-context-menu>
    <p-confirm-dialog />
  </div>
</template>

<script setup lang="ts">
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useMBus } from '~/composables/mixins/useMessagebus'
  import { useSaveParameters } from '~/composables/mixins/useSave'
  import type { T_HostParameter } from '~/types/APItypes'
  import type { PropTypeServerClient } from '~/types/tproptypes'
  import { onBeforeRouteLeave } from 'vue-router'
  import { useStrings } from '~/composables/mixins/useStrings'
  import { useDynamicHeight } from '~/composables/mixins/useDynamicHeightWindow'
  import { useBuildingConfigTree } from '~/composables/useBuildingConfigTree'
  import type { TreeNode } from 'primevue/treenode'
  import { useConfirm } from 'primevue/useconfirm'

  const confirm = useConfirm()
  const { notifyError, notifyInfo } = useNotification()
  const t_fixed = useStrings().t_fixed
  const icons = useIcons()
  const $t = useI18n().t
  const mq = useMQ()
  const routemenu = ref()

  const config = storeConfigapp().config ?? { read_only: true, server_write_access: false }
  const lastCMItem = ref<any>()
  const isLoading = ref(false)
  const fetchedData = ref<TreeNode[] | undefined>()
  const itemValues = ref<{ [key: string]: any }>({})
  const initialValues = ref<{ [key: string]: any }>({})
  const hasUnsavedChanges = ref(false)
  const changeBuffer = ref<{ [key: string]: any }>({})
  const createConfigVisible = ref(false)
  const configTree = ref<any>(null)
  const expandedKeys = ref<{ [key: string]: boolean }>({})
  const items = ref([
    {
      label: 'Create Config',
      icon: icons.add,
      command: () => {
        createConfigVisible.value = !createConfigVisible.value
      },
    },
    {
      label: 'Delete config',
      icon: icons.delete,
      command: () => {
        confirm2()
      },
    },
  ])
  const confirm2 = () => {
    confirm.require({
      message: $t('delete.confirmItem', { item: lastCMItem.value?.configId }),
      header: $t('delete'),
      icon: useIcons().delete,
      rejectLabel: $t('cancel'),
      rejectProps: {
        label: $t('cancel'),
        severity: 'secondary',
        outlined: true,
      },
      acceptProps: {
        label: $t('delete'),
        severity: 'danger',
      },
      accept: () => {
        deleteConfig(lastCMItem.value)
      },
      reject: () => {
        lastCMItem.value = undefined
      },
    })
  }
  const props = defineProps({
    id: { type: String, default: undefined },
    type: {
      type: String as PropType<PropTypeServerClient>,
      default: 'servers',
    },
    isChild: { type: Boolean, default: false },
  })
  const { maxVisibleHeight } = useDynamicHeight(
    ['btop-header', 'globalBreadcrumb', 'config-pre-tabs'],
    props.isChild ? 100 : 50
  )

  defineExpose({
    refetch: () => {
      fetchFormData()
    },
  })

  const showWarning = computed(() => {
    return !(props.type === 'servers' || props.id)
  })

  const onRightClick = (event: any, node: any) => {
    if (isGeneralDefault.value) {
      lastCMItem.value = node
      routemenu.value.show(event)
    }
  }

  function setExpandedRow(node: any) {
    expandedKeys.value[node.key] = !expandedKeys.value[node.key]
  }

  function openCreationModal() {
    lastCMItem.value = undefined
    createConfigVisible.value = !createConfigVisible.value
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

  function initInitialValues(level: TreeNode) {
    if (level.data) {
      // its a config entry
      const initialValue = getInitialValue(level.data)
      itemValues.value[level.key] = initialValue
      initialValues.value[level.key] = initialValue
    } else if (level.children) {
      // its a category / group
      level.children.forEach((child) => {
        if (child.data) {
          // child is a config entry
          const initialValue = getInitialValue(child.data)
          itemValues.value[child.data.configId] = initialValue
          initialValues.value[child.data.configId] = initialValue
        } else if (child.children) {
          // child is a category / group
          initInitialValues(child)
        }
      })
    }
  }

  async function fetchFormData() {
    if (props.type === 'servers' || props.id) await fetch()
    if (fetchedData.value) {
      for (const category in fetchedData.value) {
        initInitialValues(fetchedData.value[category])
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
        title: $t('opsiMessageBus'),
        message: $t('opsiMessageBus.config_updated', {
          configId: msg.data.configId,
        }),
        button: { label: $t('reloadPage'), onClick: fetch },
      })
    }
  }
  const isGeneralDefault = computed(() => {
    return props.type === 'servers' && !props.id
  })
  async function fetch() {
    isLoading.value = true
    let endpoint = ''
    if (!isGeneralDefault.value) {
      endpoint = `/opsidata/config/objects/${props.id}`
    } else if (props.type === 'servers') {
      endpoint = '/opsidata/config'
    } else {
      console.error('not defined')
    }
    await fetchHostParameters(endpoint)
    isLoading.value = false
  }
  async function deleteConfig(node: any) {
    const { error } = await useApiDELETE(`/opsidata/config/delete/${node.configId}`)
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      return
    }
    notifyInfo({
      title: $t('opsiMessageBus'),
      message: $t('opsiMessageBus.config_deleted', {
        configId: node.configId,
      }),
      button: { label: $t('reloadPage'), onClick: fetch },
    })
    fetchFormData()
  }
  async function fetchHostParameters(endpoint: string) {
    const { data, error } = await useApiGETBody<T_HostParameter>(endpoint)
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      return
    }
    if (data.value) {
      fetchedData.value = useBuildingConfigTree().restructureData(data.value)
    } else fetchedData.value = []
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
      url = '/opsidata/config/values'
      request = Object.keys(changeBuffer.value).map((configId) => ({
        configId,
        value: String(changeBuffer.value[configId]),
      }))
    } else if (props.type === 'clients' || props.type === 'servers') {
      url = '/opsidata/config/values/objects'
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
      const answer = window.confirm($t('message.unsavedChanges'))
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

  .tree-table-container {
    padding-left: 16px;
  }

  :deep(.p-treetable .p-treetable-toggler) {
    margin-left: 8px;
  }

  :deep(.p-treetable .p-treetable-indent) {
    width: 1.5em;
    display: inline-block;
  }

  :deep(.p-treetable),
  :deep(.p-treetable .p-treetable-thead > tr > th),
  :deep(.p-treetable .p-treetable-tbody > tr > td),
  :deep(.p-treetable .p-treetable-tbody > tr),
  :deep(.p-treetable .p-treetable-thead > tr) {
    border: none !important;
    box-shadow: none !important;
  }
</style>
