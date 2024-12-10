<template>
  <div data-testid="FHostParameter">
    <br />
    <el-alert v-if="!(props.type === 'servers' || props.id)" type="warning">
      {{ $t('alert.select') }}</el-alert
    >
    <IconILoading v-else-if="isLoading" />
    <el-collapse
      v-else
      v-model="activeNames"
      class="mr-3 ml-3"
      @change="handleCollapseValueChange"
    >
      <el-alert
        v-if="fetchedData && Object.keys(fetchedData).length === 0"
        type="warning"
        >{{ $t('message.warning.nodata') }}</el-alert
      >
      <el-collapse-item
        v-else
        v-for="(items, topic, index) in fetchedData"
        :key="topic.toString()"
        :title="topic.toString()"
        :name="index.toString()"
      >
        <FormrowFRItems
          v-if="activeNames.includes(index.toString())"
          :items="items"
          :replace-in-id="topic + '.'"
          @change-item="changeItem"
        />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useMBus } from '~/composables/mixins/useMessagebus'
  import { useSaveParameters } from '~/composables/mixins/useSave'
  import type { T_HostParameter } from '~/types/APItypes'
  import type { PropTypeServerClient } from '~/types/tproptypes'
  const { notifyError, notifyInfo } = useNotification()
  const $t = useI18n().t
  const isLoading = ref(true)
  const fetchedData = ref<T_HostParameter | undefined>()
  const activeNames = ref<string[]>([])
  const lastSavedData = ref({
    objectIds: [] as Array<string>,
    configIds: [] as Array<string>,
  })
  const props = defineProps({
    id: { type: String, default: undefined },
    type: {
      type: String as PropType<PropTypeServerClient>,
      default: 'servers',
    },
    isChild: { type: Boolean, default: false },
  })

  function handleCollapseValueChange(val: any) {
    activeNames.value = val
  }
  function changeItem(item: any, val: any) {
    if (item == undefined) return
    if (val == undefined) return

    item.value = val
    if (!item.possibleValues.includes(val)) {
      item.possibleValues.push(val)
    }

    handleSelection(item)
  }

  onMounted(async () => {
    if (props.type === 'servers' || props.id) await fetch()
  })
  watch(
    () => props.id,
    async () => {
      if (props.type === 'servers' || props.id) await fetch()
    },
  )

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
      if (
        !(
          lastSavedData.value.configIds.includes(msg.data.configId) && // configId matches
          (lastSavedData.value.objectIds.includes(msg.data.objectId) || // objectId matches
            (lastSavedData.value.objectIds.length === 0 &&
              msg.data.isDefault === true))
        )
      ) {
        notifyInfo({
          title: $t('message.info.event'),
          message: $t('message.info.event.config_updated', {
            configId: msg.data.configId,
          }),
          button: { label: $t('label.reloadPage'), onClick: fetch },
        })
      }
    }
  }

  async function fetch() {
    isLoading.value = true
    let endpoint: any = ''
    if (props.type === 'clients') {
      endpoint = `/opsidata/config/objects/${props.id}`
    } else if (props.type === 'servers' && props.id) {
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

  async function handleSelection(change: any) {
    isLoading.value = true
    let url: string = ''
    let request: any = []
    if (props.type === 'servers' && !props.id) {
      // changing default configs
      url = '/opsidata/config'
      request = [
        {
          configId: change.configId,
          value: String(change.value),
        },
      ]
      lastSavedData.value.objectIds = []
      lastSavedData.value.configIds = request.map((k: any) => k.configId)
    } else if (props.type === 'clients' || props.type === 'servers') {
      // changing clients or depots configs
      url = '/opsidata/config/objects'
      request = {
        objectIds: [props.id],
        configs: [
          {
            configId: change.configId,
            value: String(change.value),
          },
        ],
      }
      lastSavedData.value.objectIds = request.objectIds || []
      lastSavedData.value.configIds = request.configs?.map(
        (k: any) => k.configId,
      )
    } else {
      console.error('not defined')
    }
    await useSaveParameters($t).saveParameters(url, request, null, true)
    isLoading.value = false
  }
</script>
