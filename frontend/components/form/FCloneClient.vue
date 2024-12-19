<template>
  <el-form
    label-width="50%"
    :label-position="mq.isMobile.value ? 'top' : 'left'"
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

    <div
      class="button-container"
      style="display: flex; justify-content: flex-end"
    >
      <el-button @click="resetForm"> {{ $t('button.reset') }}</el-button>
      <el-button
        data-testid="cloneButton"s
        :type="sourceID && cloneClient.target.hostId ? 'success' : ''"
        @click="applyCloneClient"
        :disabled="!sourceID || !cloneClient.target.hostId"
        >{{ $t('title.clone') }}</el-button
      >
    </div>
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
        message: $t('message.warning.clientExists', {
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
        // for translation key search $t('title.target')
        hostId: '', // $t('table.fields.hostId')
        ipAddress: '', // $t('table.fields.ipAddress')
        hardwareAddress: '', // $t('table.fields.hardwareAddress')
        systemUUID: '', // $t('table.fields.systemUUID')
      },
      options: {
        // $t('title.options')
        configs: false, // $t('table.fields.configs')
        products: false, // $t('table.fields.products')
        productProperties: false, // $t('table.fields.productProperties')
      },
    }
  }
</script>
