<template>
  <el-form
    :label-width="mq.isMobile.value ? '' : '230px'"
    :label-position="mq.isMobile.value ? 'top' : 'right'"
    v-loading="isLoading"
  >
    <el-form-item v-if="!isChild" :label="$t('table.fields.sourceClient')">
      <SelectSHosts type="clients" @change="setId" :id="sourceID" />
    </el-form-item>
    <div v-for="(options, category) in cloneClient" :key="category">
      <el-row>
        <b>{{ $t('title.' + category) }} </b>
      </el-row>
      <div v-for="(value, label) in options" :key="label + value">
        <el-form-item :label="$t('table.fields.' + label)">
          <el-input
            v-if="label === 'hostId'"
            v-model="cloneClient[category][label]"
          >
            <template #append>
              <el-input v-model="domain" class="border-none" />
            </template>
          </el-input>
          <el-checkbox
            v-else-if="typeof value == 'boolean'"
            v-model="cloneClient[category][label]"
          />
          <el-input
            v-else
            v-model="cloneClient[category][label]"
            :data-testid="label"
          />
        </el-form-item>
      </div>
    </div>
    <el-form-item>
      <el-button @click="resetForm"> {{ $t('button.reset') }}</el-button>
      <el-button
        data-testid="cloneButton"
        type="primary"
        @click="applyCloneClient"
        :disabled="!sourceID || !cloneClient.target.hostId"
        >{{ $t('title.clone') }}</el-button
      >
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
  import { useClient } from '~/composables/mixins/useGet'
  import { useNotification } from '~/composables/mixins/useComponent'
  const { notifySuccess, notifyError } = useNotification()
  const storeSelection = storeSelections()
  const $t = useI18n().t
  const props = defineProps({
    id: { type: String, default: '' },
    type: { type: String, default: 'clients' },
    isChild: { type: Boolean, default: false },
  })

  const mq = useMQ()
  const isLoading = ref(false)
  const domain = ref('')
  const sourceID = ref('')
  const clientIDList = ref()
  const cloneClient = ref(getDefaultCloneClient())
  onMounted(async () => {
    await fetch()
    if (props.id != '') {
      sourceID.value = props.id
    }
    domain.value = sourceID.value.substring(sourceID.value.indexOf('.'))
  })
  watch(
    () => sourceID.value,
    async () => {
      domain.value = sourceID.value.substring(sourceID.value.indexOf('.'))
    },
  )
  function setId(id: string) {
    sourceID.value = id
  }
  async function fetch() {
    clientIDList.value = await useClient().getClientIdList(
      storeSelection.selectionDepots,
    )
  }

  async function applyCloneClient() {
    isLoading.value = true
    const cloneClientCopy = { ...cloneClient.value }
    cloneClientCopy.target.hostId += domain.value
    if (clientIDList.value.includes(cloneClientCopy.target.hostId)) {
      notifyError({
        message: $t('message.error.clientExists', {
          client: cloneClientCopy.target.hostId,
        }),
      })
      isLoading.value = false
      return
    }
    try {
      await useApiPOST(
        `/opsidata/clients/${sourceID.value}/clone`,
        cloneClientCopy,
      )
      notifySuccess({ message: $t('message.success.clone') })
    } catch (error) {
      notifyError({ message: error })
    } finally {
      isLoading.value = false
      resetForm()
    }
  }

  function resetForm() {
    cloneClient.value = getDefaultCloneClient()
  }

  function getDefaultCloneClient() {
    return {
      target: {
        hostId: '',
        ipAddress: '',
        hardwareAddress: '',
        systemUUID: '',
      },
      options: {
        configs: false,
        products: false,
        productProperties: false,
      },
    }
  }
</script>
