<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-form
    data-testid="form-clientclone"
    label-width="30%"
    :label-position="mq.isMobile.value ? 'top' : 'left'"
    v-loading="isLoading"
  >
    <el-form-item v-if="!isChild" :label="$t('sourceClient')">
      <SelectSHosts type="clients" @change="setId" :id="sourceID" filterable />
    </el-form-item>

    <div v-for="(options, category) in cloneClient" :key="category">
      <h3 class="mt-4 text-lg font-semibold">
        {{ $t(category) }}
      </h3>
      <div v-for="(value, label) in options" :key="category + '-' + label">
        <el-form-item :label="$t(label)" :error="label === 'hostId' ? clientNameError : ''">
          <!--<el-input v-if="label === 'hostId'" v-model="cloneClient[category][label]">
            <template #append>
              <el-input v-model="domain" class="border-none" />
            </template>
          </el-input>-->

          <p-input-group v-if="label === 'hostId'">
            <p-input-text
              v-model="cloneClient[category][label]"
              type="text"
              class="w-1/2"
              :data-testid="label"
              :class="{
                '!border-danger': Boolean(clientNameError),
              }"
            />
            <p-input-text v-model="domain" type="text" class="w-1/2" :data-testid="label" />
          </p-input-group>
          <p-input-mask
            v-else-if="label === 'hardwareAddress'"
            id="basic"
            v-model="cloneClient[category][label]"
            mask="**:**:**:**:**:**"
            slot-char=" "
            placeholder=""
            class="w-full"
            :class="{
              '!border-danger':
                String(cloneClient[category][label])
                  .split('')
                  .some((char) => (char > 'F' && char < 'a') || char > 'f') ||
                (String(cloneClient[category][label]).length > 0 &&
                  originalClient.hardwareAddress === cloneClient[category][label]),
            }"
          />
          <el-checkbox
            v-else-if="typeof value == 'boolean'"
            v-model="cloneClient[category][label]"
          />

          <p-input-text
            v-else
            type="text"
            class="w-full"
            v-model="cloneClient[category][label]"
            :data-testid="label"
            :class="{
              '!border-danger':
                String(cloneClient[category][label]).length > 0 &&
                originalClient[label] === cloneClient[category][label],
            }"
          />
        </el-form-item>
      </div>
    </div>

    <div class="button-container" style="display: flex; justify-content: flex-end">
      <el-button @click="resetForm"> {{ $t('reset') }}</el-button>
      <el-button
        data-testid="cloneButton"
        :type="sourceID && cloneClient.target.hostId ? 'success' : ''"
        @click="applyCloneClient"
        :disabled="!sourceID || !cloneClient.target.hostId || clientExists"
        >{{ $t('clone') }}</el-button
      >
    </div>
  </el-form>
</template>

<script setup lang="ts">
  import { useClient } from '~/composables/mixins/useGet'
  import { useNotification } from '~/composables/mixins/useComponent'
  interface THost {
    hostId: string
    ipAddress?: string
    hardwareAddress?: string
    [key: string]: any
  }

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
  const sourceID = ref(props.id)
  const clientIDList = ref()
  const cloneClient = ref(getDefaultCloneClient())
  const originalClient = ref<THost>({
    hostId: '',
    ipAddress: '',
    hardwareAddress: '',
  })
  const clientNameError = ref('')
  const clientExists = ref(false)
  onMounted(async () => {
    await fetch()
    if (props.id != '') {
      sourceID.value = props.id
    }

    if (sourceID.value) {
      await fetchOne()
    }
    domain.value = sourceID.value.substring(sourceID.value.indexOf('.'))
    cloneClient.value.target.hostId = sourceID.value.split('.')[0]
  })
  watch(
    () => sourceID.value,
    async () => {
      if (sourceID.value) {
        await fetchOne()
      } else {
        resetForm()
      }
      domain.value = sourceID.value.substring(sourceID.value.indexOf('.'))
      cloneClient.value.target.hostId = sourceID.value.split('.')[0]
    }
  )
  watch(
    () => cloneClient.value.target.hostId,
    async (newClientName) => {
      if (!newClientName) {
        clientExists.value = false
        clientNameError.value = ''
        return
      }

      const fullHostId = `${newClientName}${domain.value}`
      if (clientIDList.value.includes(fullHostId)) {
        clientExists.value = true
        clientNameError.value = $t('message.alreadyExists', {
          item: fullHostId,
        })
      } else {
        clientExists.value = false
        clientNameError.value = ''
      }
    }
  )

  function setId(id: string) {
    sourceID.value = id
  }
  async function fetch() {
    clientIDList.value = await useClient().getClientIdList(storeSelection.selectionDepots)
  }
  async function fetchOne() {
    //const urkl = /api/opsidata/clients/test-123.uib.local'
    const url = `/opsidata/clients/${sourceID.value}`
    try {
      const { data, error } = await useApiGET<THost>(url)
      if (error || !data) return
      originalClient.value.hardwareAddress = data.value?.hardwareAddress || ''
      originalClient.value.ipAddress = data.value?.ipAddress || ''

      cloneClient.value.target.ipAddress = originalClient.value.ipAddress || ''
      cloneClient.value.target.hardwareAddress = originalClient.value.hardwareAddress || ''
    } catch (error) {
      notifyError({ message: error })
    }
  }

  async function applyCloneClient() {
    isLoading.value = true
    const cloneClientCopy = { ...cloneClient.value }
    cloneClientCopy.target.hostId += domain.value
    if (clientIDList.value.includes(cloneClientCopy.target.hostId)) {
      notifyError({
        message: $t('message.alreadyExists', {
          item: cloneClientCopy.target.hostId,
        }),
      })
      isLoading.value = false
      return
    }
    try {
      await useApiPOST(`/opsidata/clients/${sourceID.value}/clone`, cloneClientCopy)
      notifySuccess({ message: $t('message.clientCloned') })
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
      },
      options: {
        configs: true,
        products: true,
        productProperties: true,
      },
    }
  }
</script>
