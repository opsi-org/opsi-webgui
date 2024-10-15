<template>
  <el-dropdown trigger="click">
    <el-button class="ml-0">
      <IconIIcon :icon="getIcon(props.icon)" :title="$t('button.tablerow.moreoptions')" />
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <div v-for="action in clientActions" :key="action" :data-testid="`client-action-${action}`">
          <el-popover :width="mq.isMobile.value ? '100%' : '360px'" trigger="click" v-model="popoverVisible">
            <template #reference>
              <el-button size="small" class="w-full text-left" :data-testid="`popover-${action}-button`">
                ><IconIIcon :icon="getIcon(action)" class="mr-1" />
                {{ $t('label.' + action) }}
              </el-button>
            </template>
            <el-text tag="b">{{ $t('label.' + action) }}</el-text> -
            <el-text tag="i">{{ props.clientIds[0] }}</el-text>
            <el-text v-if="props.clientIds.length > 1">+{{ props.clientIds.length - 1 }}</el-text>
            <el-form label-position="top" class="mt-3" v-loading="isLoading">
              <el-form-item v-if="action == 'notify'" :label="$t('button.event.showpopup.message')">
                <el-input v-model="notifyText" class="w-100" />
              </el-form-item>

              <div v-if="action == 'deployclientagent'">
                <div v-for="(value, label) in opsiClientAgent" :key="label">
                  <el-form-item :label="$t('form.' + label)">
                    <el-radio-group v-if="label === 'type'" v-model="opsiClientAgent[label.toString()]">
                      <el-radio v-for="os in ['Windows', 'Linux', 'Mac']" :key="os" :value="os">{{ os }}</el-radio>
                    </el-radio-group>
                    <el-input v-else-if="label === 'password'" v-model="opsiClientAgent[label.toString()]" show-password />
                    <el-input v-else v-model="opsiClientAgent[label.toString()]" />
                  </el-form-item>
                </div>
              </div>
              <el-button
                class="float-right"
                :type="action == 'delete' ? 'danger' : 'success'"
                size="small"
                :data-testid="`popover-${action}`"
                @click="executeClientAction(action)"
              >
                {{ $t('label.' + action) }}
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
  import type { IObjectString2Function, IObjectString2String } from '~/types/tgeneral'
  const $t = useI18n().t
  const { notifyError } = useNotification()
  const icons = useIcons()
  const mq = useMQ()
  const props = defineProps({
    clientIds: { type: Array, default: () => [] },
    icon: { type: String, default: 'menu' },
  })
  const popoverVisible = ref<boolean>(false)
  const isLoading = ref<boolean>(false)
  const notifyText = ref<string>('')
  const clientActions = ref<Array<string>>(['ondemand', 'notify', 'reboot', 'deployclientagent', 'delete'])
  const opsiClientAgent = ref<IObjectString2String>({
    username: '',
    password: '',
    type: 'windows',
  })

  const actionMethods: IObjectString2Function = {
    ondemand: () =>
      useApiPOST('/command/opsiclientd_rpc', {
        client_ids: props.clientIds,
        method: 'fireEvent',
        params: ['on_demand'],
      }),
    notify: () =>
      useApiPOST('/command/opsiclientd_rpc', {
        client_ids: props.clientIds,
        method: 'showPopup',
        params: [notifyText.value],
      }),
    reboot: () =>
      useApiPOST('/command/opsiclientd_rpc', {
        client_ids: props.clientIds,
        method: 'reboot',
        params: [''],
      }),
    deployclientagent: () => useApiPOST('/command/deployclientagent', opsiClientAgent.value),
    delete: () => useApiDELETE(`/opsidata/clients/${props.clientIds}`),
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
</script>
