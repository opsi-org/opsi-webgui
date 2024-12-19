<template>
  <div data-testid="FHostAttributes">
    <el-alert v-if="!props.id" type="warning">{{
      $t('button.select')
    }}</el-alert>
    <el-form
      v-if="hostAttributes.length && hostAttributes[0]"
      label-width="50%"
      :label-position="mq.isMobile.value ? 'top' : 'left'"
      v-loading="isLoading"
    >
      <div class="h-[70vh] overflow-y-auto">
        <div v-for="(value, label) in hostAttributes[0]" :key="label">
          <el-form-item :label="`${$t('table.fields.' + label)}`">
            <el-checkbox
              v-if="typeof value === 'boolean'"
              v-model="hostAttributes[0][label]"
              :value="value"
              :disabled="notEditable.includes(label)"
              @change="setUnsavedChanges"
            />
            <el-input
              v-else-if="isInputPasswordLabel(label)"
              v-model="hostAttributes[0][label]"
              :value="value"
              show-password
              :disabled="notEditable.includes(label)"
              @input="setUnsavedChanges"
            />
            <el-input
              v-else-if="isInputDateLabel(label)"
              :value="useFormat().date(value)"
              disabled
            />
            <el-input
              v-else
              v-model="hostAttributes[0][label]"
              :value="value"
              :disabled="notEditable.includes(label)"
              @input="setUnsavedChanges"
            />
          </el-form-item>
        </div>
      </div>

      <div
        v-if="hostAttributes[0].type !== 'OpsiDepotserver'"
        class="button-container"
        style="display: flex; justify-content: flex-end"
      >
        <el-button @click="resetForm">{{ $t('button.reset') }}</el-button>
        <el-button
          :type="hasUnsavedChanges ? 'success' : ''"
          :disabled="!hasUnsavedChanges"
          @click="saveHostAttributes"
          >{{ $t('button.save') }}</el-button
        >
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
  import type { T_ServerAttr, T_ClientAttr } from '~/types/APItypes'
  import type { IObjectString2Any } from '~/types/tgeneral'
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useSetUEFI } from '~/composables/mixins/usePost'
  import { useFormat } from '~/composables/mixins/useFormat'
  import { useMBus } from '~/composables/mixins/useMessagebus'
  import { objectEqual } from '~/utils/scompares'
  import type { PropTypeServerClient } from '~/types/tproptypes'
  import { onBeforeRouteLeave } from 'vue-router'

  const $t = useI18n().t
  const mq = useMQ()

  const _msgbus = useMBus(wsBusMsgObjectChanged, false, $t)
  const { notifySuccess, notifyError, notifyInfo } = useNotification()
  const hostAttributes = ref<Array<T_ServerAttr | T_ClientAttr>>([])
  const hostAttributesOriginal = ref<Array<T_ServerAttr | T_ClientAttr>>([])
  const hasUnsavedChanges = ref(false)
  const isLoading = ref(true)

  const notEditable = ['type', 'created', 'lastSeen', 'systemUUID', 'uefi']
  const props = defineProps({
    id: { type: String, default: undefined },
    type: {
      type: String as PropType<PropTypeServerClient>,
      default: 'servers',
    },
    isChild: { type: Boolean, default: false },
  })

  watchEffect(() => {
    if (props.id) fetchData()
  })

  const isInputPasswordLabel = (label: string) => {
    return ['opsiHostKey', 'oneTimePassword'].includes(label)
  }

  const isInputDateLabel = (label: string) => {
    return ['created', 'lastSeen'].includes(label)
  }

  async function fetchData() {
    isLoading.value = true
    const url =
      props.type === 'servers'
        ? `/opsidata/servers?servers=[${props.id}]`
        : `/opsidata/hosts?hosts=${props.id}`
    try {
      const { data, error } =
        await useApiGETBody<Array<T_ServerAttr | T_ClientAttr>>(url)
      if (error)
        throw new Error(
          error.response?.data?.message || $t('message.error.generic'),
        )
      if (!data.value)
        throw new Error(
          $t('message.error.empty-response', { details: 'HostAttributes' }),
        )
      hostAttributes.value = data.value
      hostAttributesOriginal.value = JSON.parse(JSON.stringify(data.value))
      hasUnsavedChanges.value = false
    } catch (error) {
      notifyError({ message: error || $t('message.error.unexpected') })
    }
    isLoading.value = false
  }

  function setUnsavedChanges() {
    hasUnsavedChanges.value = !objectEqual(
      hostAttributes.value[0],
      hostAttributesOriginal.value[0],
    )
  }

  async function resetForm() {
    if (props.id) fetchData()
  }

  async function saveHostAttributes() {
    const hostAttr: IObjectString2Any = {
      ...hostAttributes?.value[0],
      uefi: undefined,
    }
    if (props.type === 'clients' && Object.keys(hostAttr).includes('uefi')) {
      if (typeof hostAttr.uefi !== 'undefined') {
        await useSetUEFI($t).setUEFI(
          hostAttr.hostId,
          (hostAttr.uefi as string).toString(),
        )
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    notEditable.forEach((attrKey) => delete hostAttr[attrKey])

    try {
      const { error } = await useApiPUT(
        `/opsidata/${props.type}/${hostAttr.hostId}`,
        hostAttr,
      )
      if (error)
        throw new Error(
          error.response?.data?.message || $t('message.error.generic'),
        )
      notifySuccess({
        message: $t('message.success.save.hostattributes', {
          host: hostAttr.hostId,
        }),
      })
      hostAttributesOriginal.value = JSON.parse(
        JSON.stringify(hostAttributes.value),
      )
      hasUnsavedChanges.value = false
    } catch (error) {
      notifyError({ message: error || $t('message.error.unexpected') })
    }
  }

  async function wsBusMsgObjectChanged(msg: any = undefined) {
    if (msg && msg.channel === 'event:host_updated') {
      if (msg.data.id === props.id) {
        notifyInfo({
          title: $t('message.info.event'),
          message: $t('message.info.event.client_updated', {
            clientId: msg.data.id,
          }),
          button: {
            label: $t('label.reloadPage'),
            onClick: fetchData,
          },
        })
      }
    }
    if (msg && ['host_connected', 'host_disconnected'].includes(msg.event)) {
      console.warn('message bus: ', msg)
    }
  }

  onBeforeRouteLeave((to, from, next) => {
    if (hasUnsavedChanges.value) {
      const answer = window.confirm($t('message.warning.unsaved_changes'))
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
