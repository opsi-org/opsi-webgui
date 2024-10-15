<template>
  <div data-testid="FHostAttributes">
    <el-alert v-if="!props.id" type="warning">{{  $t('button.select') }}</el-alert>
    <el-form v-if="hostAttributes.length && hostAttributes[0]"  label-width="200px" class="w-full">
      <div v-for="(value, label) in hostAttributes[0]" :key="label">
        <el-form-item :label="`${$t('table.fields.' + label)}`">
          <el-checkbox v-if="typeof value === 'boolean'" v-model="hostAttributes[0][label]" :value="value" />
          <el-input v-else-if="isInputPasswordLabel(label)" v-model="hostAttributes[0][label]" :value="value" show-password />
          <el-input v-else-if="isInputDateLabel(label)" :value="useFormat().date(value)" disabled />
          <el-input v-else v-model="hostAttributes[0][label]" :value="value" />
        </el-form-item>
      </div>
    </el-form>
    <el-form v-if="hostAttributes.length && hostAttributes[0] && hostAttributes[0].type !== 'OpsiDepotserver'"  label-width="200px" class="w-full">
      <el-form-item>
        <el-button @click="resetForm">{{ $t('button.reset') }}</el-button>
        <el-button
          :type="objectEqual(hostAttributes[0], hostAttributesOriginal[0]) ? 'success': 'danger'"
          :disabled="objectEqual(hostAttributes[0], hostAttributesOriginal[0])"
          @click="saveHostAttributes">{{ $t('button.save') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useSetUEFI } from '~/composables/mixins/usePost'
  import { useFormat } from '~/composables/mixins/useFormat'
  import type { T_ServerAttr, T_ClientAttr } from '~/types/APItypes'
  import type { IObjectString2Any } from '~/types/tgeneral';
  import { objectEqual } from '~/utils/scompares';

  const $t = useI18n().t

  const { notifySuccess, notifyError } = useNotification()
  const hostAttributes = ref<Array<T_ServerAttr | T_ClientAttr>>([])
  const hostAttributesOriginal = ref<Array<T_ServerAttr | T_ClientAttr>>([])

  const props = defineProps({
    id: { type: String, default: undefined },
    type: { type: String, default: 'servers' },
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
    const url = props.type === 'servers' ? `/opsidata/servers?servers=[${props.id}]` : `/opsidata/hosts?hosts=${props.id}`
    try {
      const { data, error } = await useApiGETBody<Array<T_ServerAttr | T_ClientAttr>>(url)
      if (error) throw new Error(error.response?.data?.message || $t('message.error.generic'))
      if (!data.value) throw new Error($t('message.error.empty-response', { details: 'HostAttributes' }))
      hostAttributes.value = data.value
      hostAttributesOriginal.value = JSON.parse(JSON.stringify(data.value))
    } catch (error) {
      notifyError({ message: error || $t('message.error.unexpected') })
    }
  }

  async function resetForm() {
    if (props.id) fetchData()
  }

  async function saveHostAttributes() {
    const hostAttr: IObjectString2Any = { ...hostAttributes?.value[0], uefi: undefined }

    if (props.type === 'clients' && Object.keys(hostAttr).includes('uefi')) {
      if (typeof hostAttr.uefi !== 'undefined') {
        await useSetUEFI($t).setUEFI(hostAttr.hostId, (hostAttr.uefi as string).toString())
      }
    }

    const attrsToDelete = ['type', 'created', 'lastSeen', 'systemUUID', 'uefi']
    attrsToDelete.forEach((attrKey) => delete hostAttr[attrKey])

    try {
      const endPoint = `/api/opsidata/${props.type}/${hostAttr.hostId}`
      const { error } = await useApiPUT(endPoint, hostAttr)
      if (error) throw new Error(error.response?.data?.message || $t('message.error.generic'))
      notifySuccess({ message: $t('message.success.save.hostattributes', { host: hostAttr.hostId }) })
      fetchData()
    } catch (error) {
      notifyError({ message: error || $t('message.error.unexpected') })
    }
  }
</script>
