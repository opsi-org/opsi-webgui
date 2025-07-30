<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-dropdown>
    <el-button class="ml-1 mt-1" :link="props.link" :disabled="isLoading || disabled">
      <IconIIcon :icon="getIcon(props.icon)" :title="$t('clientActions')" />
      <IconILoading v-if="isLoading" class="ml-1" small :title="$t('message.loading')" />
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <div v-for="action in clientActions" :key="action" :data-testid="`client-action-${action}`">
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
                :disabled="disabled"
              >
                <IconIIcon :icon="getIcon(action)" class="mr-1" />
                {{ $t(action) }}
              </el-button>
            </template>
            <el-text tag="b" class="text-capitalize after:content-['-']">{{ $t(action) }}</el-text>
            <el-text tag="i">{{ props.clientIds[0] }}</el-text>
            <el-text v-if="props.clientIds.length > 1" class="pl-2">
              {{ $t('countMore', { clients: props.clientIds.length }) }}
            </el-text>
            <el-form label-position="top" class="mt-3" v-loading="isLoading">
              <el-form-item v-if="action == 'notify'" :label="$t('enterNotificationText')">
                <el-input
                  v-model="notifyText"
                  class="w-100"
                  @keydown.enter.prevent="executeClientAction('notify')"
                />
              </el-form-item>

              <div v-if="action == 'deployClientAgent'">
                <div v-for="key in Object.keys(opsiClientAgent)" :key="key">
                  <el-form-item :label="$t(key)">
                    <el-radio-group v-if="key === 'type'" v-model="opsiClientAgent[key]">
                      <el-radio v-for="os in ['Windows', 'Linux', 'Mac']" :key="os" :value="os">{{
                        os
                      }}</el-radio>
                    </el-radio-group>
                    <el-input
                      v-else-if="key === 'password'"
                      v-model="opsiClientAgent[key.toString()]"
                      show-password
                    />
                    <el-input v-else v-model="opsiClientAgent[key.toString()]" />
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
                {{ $t(action) }}
              </el-button>
            </el-form>
          </el-popover>
        </div>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
  import { useNotification } from '~/composables/mixins/useComponent'
  import type { IObjectString2Function, IObjectString2String } from '~/types/tgeneral'

  const $t = useI18n().t
  const { notifySuccess, notifyError, notifyDetailed } = useNotification()
  const icons = useIcons()
  const mq = useMQ()
  const props = defineProps({
    clientIds: { type: Array<string>, default: () => [] },
    icon: { type: String, default: 'menu' },
    link: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
  })

  const { selectionClients } = storeToRefs(storeSelections())
  const popoverVisible = ref<boolean>(false)
  const isLoading = ref<boolean>(false)
  const notifyText = ref<string>('')
  const clientActions = ref<Array<string>>([
    'onDemand',
    'notify',
    'reboot',
    'deployClientAgent',
    'delete',
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
    onDemand: async () => {
      const { data, error } = await useApiPOST<TClientdRPC>('/command/opsiclientd_rpc', {
        client_ids: props.clientIds,
        method: 'fireEvent',
        params: ['on_demand'],
      })
      collectResult($t('onDemand'), data.value, error)
    },
    notify: async () => {
      const { data, error } = await useApiPOST<TClientdRPC>('/command/opsiclientd_rpc', {
        client_ids: props.clientIds,
        method: 'showPopup',
        params: [notifyText.value],
      })
      collectResult($t('notify'), data.value, error)
    },
    reboot: async () => {
      const { data, error } = await useApiPOST<TClientdRPC>('/command/opsiclientd_rpc', {
        client_ids: props.clientIds,
        method: 'reboot',
        params: [''],
      })
      collectResult($t('reboot'), data.value, error)
    },
    deployClientAgent: async () => {
      const { error } = await useApiPOST<TClientdRPC>('/opsidata/clients/deploy', {
        ...opsiClientAgent.value,
        clients: props.clientIds,
      })
      if (error) return
      notifySuccess({
        title: $t('message.success') + ': ',
        message: $t('message.success.clientAgentDeployed', {
          count: props.clientIds.length,
        }),
      })
    },
    delete: async () => {
      const deletedIds: Array<string> = []
      for (const clientId of props.clientIds) {
        const { error } = await useApiDELETE<TClientdRPC>(`/opsidata/clients/${clientId}`)
        if (error) return
        deletedIds.push(clientId)
      }
      for (const clientId of deletedIds) {
        if (selectionClients.value.includes(clientId)) {
          storeSelections().delFromSelectionClients(clientId)
        }
      }
      notifySuccess({
        title: $t('message.success') + ': ',
        message: $t('message.success.clientsDeleted', {
          count: deletedIds.length,
        }),
      })
    },
  }

  function getIcon(icon: string) {
    if (Object.keys(icons).includes(icon)) return (icons as Record<string, string>)[icon]
    throw new Error(`Icon ${icon} not found`)
  }
  async function executeClientAction(action: string) {
    if (isLoading.value) return

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

  function collectResult(notificationTitle: string, data: TClientdRPC | undefined, error: any) {
    if (error) return
    if (data == undefined) {
      notifyError({
        message: error?.response?.data?.message || 'No data received (1)',
      })
      return
    }

    const resultRows: Array<any> = []
    const resultRowOk = {
      msg: '', // TBA
      title: $t('message.success') + ': ',
      tagTitle: 'strong',
      class: '!text-success',
      tag: 'span',
    }
    for (const [key, value] of Object.entries(data)) {
      if (value.result) {
        // result is given. success
        resultRowOk.msg = resultRowOk.msg + key + ', '
        continue
      }
      // error
      resultRows.push({
        tag: 'span',
        tagTitle: 'strong',
        title: key + ': ',
        msg: value.error || value.result,
        class: '!text-danger mb-2 ',
      })
    }
    if (resultRowOk.msg && resultRowOk.msg.length > 0) {
      resultRowOk.msg = resultRowOk.msg.slice(0, -2)
      resultRows.push(resultRowOk)
    }
    notifyDetailed({
      title: notificationTitle,
      messages: resultRows,
      wrapperClass: 'grid',
      duration: 0,
    })
  }
</script>
