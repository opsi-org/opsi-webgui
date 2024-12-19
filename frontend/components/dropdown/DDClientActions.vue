<template>
  <el-dropdown>
    <el-button class="ml-1 mt-1" :link="props.link" :disabled="isLoading">
      <IconIIcon
        :icon="getIcon(props.icon)"
        :title="$t('label.clientaction')"
      />
      <IconILoading
        v-if="isLoading"
        class="ml-1"
        small
        :title="$t('message.loading')"
      />
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <div
          v-for="action in clientActions"
          :key="action"
          :data-testid="`client-action-${action}`"
        >
          <el-popover
            :width="mq.isMobile.value ? '100%' : '360px'"
            trigger="click"
            v-model="popoverVisible"
            placement="left"
          >
            <template #reference>
              <el-button
                class="w-full !text-left !inline !border-0"
                :data-testid="`popover-${action}-button`"
              >
                <IconIIcon :icon="getIcon(action)" class="mr-1" />
                {{ $t('button.event.' + action) }}
              </el-button>
            </template>
            <el-text tag="b" class="text-capitalize after:content-['-']">{{
              $t('button.event.' + action)
            }}</el-text>
            <el-text tag="i">{{ props.clientIds[0] }}</el-text>
            <el-text v-if="props.clientIds.length > 1" class="pl-2">
              {{ ` (+${props.clientIds.length - 1} ${$t('info.more')})` }}
            </el-text>
            <el-form label-position="top" class="mt-3" v-loading="isLoading">
              <el-form-item
                v-if="action == 'notify'"
                :label="$t('button.event.showpopup.message')"
              >
                <el-input v-model="notifyText" class="w-100" />
              </el-form-item>

              <div v-if="action == 'deployclientagent'">
                <div v-for="(value, label) in opsiClientAgent" :key="label">
                  <el-form-item :label="$t('form.' + label)">
                    <el-radio-group
                      v-if="label === 'type'"
                      v-model="opsiClientAgent[label.toString()]"
                    >
                      <el-radio
                        v-for="os in ['Windows', 'Linux', 'Mac']"
                        :key="os"
                        :value="os"
                        >{{ os }}</el-radio
                      >
                    </el-radio-group>
                    <el-input
                      v-else-if="label === 'password'"
                      v-model="opsiClientAgent[label.toString()]"
                      show-password
                    />
                    <el-input
                      v-else
                      v-model="opsiClientAgent[label.toString()]"
                    />
                  </el-form-item>
                </div>
              </div>
              <el-button
                class="float-right"
                :type="action == 'delete' ? 'danger' : 'success'"
                size="small"
                :disabled="isLoading"
                :data-testid="`popover-${action}`"
                @click="executeClientAction(action)"
              >
                {{ $t('button.event.' + action) }}
              </el-button>
            </el-form>
          </el-popover>
        </div>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
  import { useIcons } from '@/composables/mixins/useIcons'
  import { useNotification } from '~/composables/mixins/useComponent'
  import type {
    IObjectString2Function,
    IObjectString2String,
  } from '~/types/tgeneral'

  const $t = useI18n().t
  const { notifySuccess, notifyError, notifyDetailed } = useNotification()
  const icons = useIcons()
  const mq = useMQ()
  const props = defineProps({
    clientIds: { type: Array<string>, default: () => [] },
    icon: { type: String, default: 'menu' },
    link: { type: Boolean, default: true },
  })

  const { selectionClients } = storeToRefs(storeSelections())
  const popoverVisible = ref<boolean>(false)
  const isLoading = ref<boolean>(false)
  const notifyText = ref<string>('')
  const clientActions = ref<Array<string>>([
    'ondemand', // for translation key search: $t('button.event.ondemand')
    'notify', // for translation key search: $t('button.event.notify')
    'reboot', // for translation key search: $t('button.event.reboot')
    'deployclientagent', // for translation key search: $t('button.event.deployclientagent')
    'delete', // for translation key search: $t('button.event.delete')
  ])
  const opsiClientAgent = ref<IObjectString2String>({
    username: '',
    password: '',
    type: 'windows',
  })

  interface TClientdRPC {
    [key: string]: {
      error?: string | null
      result?: string | null
    }
  }

  const actionMethods: IObjectString2Function = {
    ondemand: async () => {
      const { data, error } = await useApiPOST<TClientdRPC>(
        '/command/opsiclientd_rpc',
        {
          client_ids: props.clientIds,
          method: 'fireEvent',
          params: ['on_demand'],
        },
      )
      collectResult($t('button.event.ondemand'), data.value, error)
    },
    notify: async () => {
      const { data, error } = await useApiPOST<TClientdRPC>(
        '/command/opsiclientd_rpc',
        {
          client_ids: props.clientIds,
          method: 'showPopup',
          params: [notifyText.value],
        },
      )
      collectResult($t('button.event.notify'), data.value, error)
    },
    reboot: async () => {
      const { data, error } = await useApiPOST<TClientdRPC>(
        '/command/opsiclientd_rpc',
        {
          client_ids: props.clientIds,
          method: 'reboot',
          params: [''],
        },
      )
      collectResult($t('button.event.reboot'), data.value, error)
    },
    deployclientagent: async () => {
      const { error } = await useApiPOST<TClientdRPC>(
        '/opsidata/clients/deploy',
        { ...opsiClientAgent.value, clients: props.clientIds },
      )
      if (error) {
        notifyError({
          message: error?.response?.data?.message || 'No data received',
        })
        return
      }
      notifySuccess({
        title: $t('message.success.title') + ': ',
        message: $t('message.success.clientagents', {
          count: props.clientIds.length,
        }),
      })
    },
    delete: async () => {
      const deletedIds: Array<string> = []
      for (const clientId of props.clientIds) {
        const { error } = await useApiDELETE<TClientdRPC>(
          `/opsidata/clients/${clientId}`,
        )
        if (error) {
          notifyError({
            message: error?.response?.data?.message || 'No data received',
          })
          return
        }
        deletedIds.push(clientId)
      }
      for (const clientId of deletedIds) {
        if (selectionClients.value.includes(clientId)) {
          storeSelections().delFromSelectionClients(clientId)
        }
      }
      notifySuccess({
        title: $t('message.success.title') + ': ',
        message: $t('message.success.deleteClients', {
          count: deletedIds.length,
        }),
        // button: { // done automatically by messagebus event host_deleted
        //   label: $t('label.reloadPage'),
        //   onClick: () => window.location.reload(),
        // },
      })
    },
  }

  function getIcon(icon: string) {
    if (Object.keys(icons).includes(icon))
      return (icons as Record<string, string>)[icon]
    throw new Error(`Icon ${icon} not found`)
  }
  async function executeClientAction(action: string) {
    isLoading.value = true
    if (actionMethods[action]) {
      try {
        await actionMethods[action]()
        popoverVisible.value = false
      } catch (error) {
        notifyError({ message: error })
      } finally {
        isLoading.value = false
      }
    }
  }

  function collectResult(
    notificationTitle: string,
    data: TClientdRPC | undefined,
    error: any,
  ) {
    if (error || data == undefined) {
      notifyError({
        message: error?.response?.data?.message || 'No data received (1)',
      })
      return
    }

    const resultRows = ref<Array<any>>([])
    const resultRowOk = ref({
      msg: '', // TBA
      title: $t('message.success.title') + ': ',
      tagTitle: 'strong',
      class: '!text-success',
      tag: 'span',
    })
    for (const [key, value] of Object.entries(data)) {
      if (value.result) {
        // result is given. success
        resultRowOk.value.msg = resultRowOk.value.msg + key + ', '
        continue
      }
      // error
      resultRows.value.push({
        tag: 'span',
        tagTitle: 'strong',
        title: key + ': ',
        msg: value.error || value.result,
        class: '!text-danger mb-2 ',
      })
    }
    if (resultRowOk.value.msg && resultRowOk.value.msg.length > 0) {
      resultRowOk.value.msg = resultRowOk.value.msg.slice(0, -2)
      resultRows.value.push(resultRowOk.value)
    }
    notifyDetailed({
      title: notificationTitle,
      messages: resultRows.value,
      wrapperClass: 'grid',
      duration: 0,
    })
  }
</script>
