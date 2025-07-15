<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-form
    label-width="30%"
    :label-position="mq.isMobile.value ? 'top' : 'left'"
    v-loading="isLoading"
  >
    <div v-for="(options, category, index) in createClient" :key="index">
      <h3 class="mt-4 text-lg font-semibold">
        {{ $t(category) }}
      </h3>
      <div v-for="(value, label) in options" :key="label + '-' + value">
        <el-form-item :label="$t(label)" :error="label === 'hostId' ? clientNameError : ''">
          <el-form v-if="label === 'opsiClientAgent'" :inline="true" label-position="top">
            <div
              v-for="(value2, label2) in createClient.initialSetup.opsiClientAgent"
              :key="label2 + value2"
            >
              <div v-if="label2 == 'setup'">
                <el-checkbox
                  v-model="createClient.initialSetup.opsiClientAgent[label2.toString()]"
                  class="w-full"
                />
              </div>
              <el-form-item
                v-else
                :label="$t(label2)"
                :class="{
                  '!hidden': !createClient.initialSetup.opsiClientAgent.setup,
                }"
              >
                <el-select
                  v-if="label2 === 'type'"
                  filterable
                  v-model="createClient.initialSetup.opsiClientAgent[label2.toString()]"
                >
                  <el-option
                    v-for="item in ['windows', 'linux', 'mac']"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
                <el-input
                  v-else-if="label2 === 'password'"
                  v-model="createClient.initialSetup.opsiClientAgent[label2.toString()]"
                  show-password
                />
                <el-input
                  v-else
                  v-model="createClient.initialSetup.opsiClientAgent[label2.toString()]"
                />
              </el-form-item>
            </div>
          </el-form>
          <el-select
            v-else-if="label === 'depot'"
            filterable
            v-model="createClient.assignments.depot"
            clearable
          >
            <el-option v-for="item in depotIDList" :key="item" :label="item" :value="item" />
          </el-select>
          <el-select
            v-else-if="label === 'groups'"
            filterable
            v-model="createClient.assignments.groups"
            clearable
          >
            <el-option v-for="item in groupList" :key="item" :label="item" :value="item" />
          </el-select>

          <el-select
            v-else-if="label === 'netbootProducts'"
            filterable
            v-model="createClient.initialSetup.netbootProducts"
            clearable
          >
            <el-option v-for="item in netbootProductList" :key="item" :label="item" :value="item" />
          </el-select>
          <el-input v-else-if="label === 'hostId'" v-model="clientName">
            <template #append>
              <el-input v-model="domain" class="border-none" />
            </template>
          </el-input>
          <el-checkbox
            v-else-if="typeof value == 'boolean'"
            v-model="createClient[category][label]"
          />
          <el-input v-else v-model="createClient[category][label]" :data-testid="label" />
        </el-form-item>
      </div>
    </div>
    <div class="button-container" style="display: flex; justify-content: flex-end">
      <el-button @click="resetForm()"> {{ $t('reset') }}</el-button>
      <el-button
        data-testid="clientCreate_addButton"
        :type="clientName ? 'success' : ''"
        :disabled="!clientName || clientExists"
        @click="createOpsiClient"
        >{{ $t('create') }}</el-button
      >
    </div>
  </el-form>
</template>

<script setup lang="ts">
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useDepot, useClient } from '~/composables/mixins/useGet'
  import type { T_ClientAttr, T_DepotIds, T_Product } from '~/types/APItypes'
  import type { IObjectString2Any } from '~/types/tgeneral'

  interface IClientObject {
    basics: {
      hostId: string
      description: string
      inventoryNumber: string
      hardwareAddress: string
      ipAddress: string | null
      notes: string
    }
    assignments: {
      depot: string
      groups: string[]
    }
    initialSetup: {
      netbootProducts: string[]
      opsiClientAgent: IObjectString2Any
    }
  }

  const mq = useMQ()
  const $t = useI18n().t
  const { notifySuccess, notifyError } = useNotification()
  const isLoading = ref(false)
  const depotIDList = ref<T_DepotIds>([])
  const clientIDList = ref()
  const netbootProductList = ref()
  const groupList = ref()
  const clientName = ref('')
  const domain = ref('')
  const clientNameError = ref('')
  const clientExists = ref(false)

  const createClient = ref<IClientObject>(getDefaultCreateClient())

  onMounted(async () => {
    await fetchInitialData()
  })

  watch(
    () => createClient.value.assignments.depot,
    async () => {
      await fetchDepotSpecificData()
    }
  )

  watch(clientName, async (newClientName) => {
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
  })

  async function fetchInitialData() {
    const opsiconfigserver = storeCache().opsiconfigserver
    domain.value = opsiconfigserver.substring(opsiconfigserver.indexOf('.'))
    createClient.value.assignments.depot = opsiconfigserver
    await fetchDepotSpecificData()
    await fetchGroups()
  }

  async function fetchDepotSpecificData() {
    depotIDList.value = await useDepot($t).getDepotIdList()
    clientIDList.value = await useClient().getClientIdList([createClient.value.assignments.depot])
    await fetchNetbootProducts()
  }

  async function fetchGroups() {
    const { data, error } = await useApiGET('/opsidata/hosts/groups/id')
    if (error) {
      return
    }
    groupList.value = data.value
  }

  async function fetchNetbootProducts() {
    const depot =
      createClient.value.assignments.depot !== ''
        ? createClient.value.assignments.depot
        : storeCache().opsiconfigserver
    await useApiGET(`/opsidata/depots/products?selectedDepots=[${depot}]`)
      .then((response) => {
        if (Array.isArray(response.data.value)) {
          netbootProductList.value = response.data.value.map((item: T_Product) => item.productId)
        }
      })
      .catch((error) => {
        //notifyError({ message: error?.response?.data?.message })
      })
  }

  async function createOpsiClient() {
    createClient.value.basics.hostId = `${clientName.value}${domain.value}`
    isLoading.value = true
    const request = {
      client: createClient.value.basics,
      depot: createClient.value.assignments.depot,
    }
    const { error } = await useApiPOST<T_ClientAttr>('/opsidata/clients', request)

    if (error) {
      notifyError({ message: error?.response?.data?.message })
      return
    } else {
      notifySuccess({
        message: $t('message.addedSuccessfully', {
          item: createClient.value.basics.hostId,
        }),
      })

      if (createClient.value.assignments.groups?.length > 0) {
        await handleApiPost(`/opsidata/clients/${createClient.value.basics.hostId}/groups`, [
          createClient.value.assignments.groups,
        ])
      }
      if (createClient.value.initialSetup.opsiClientAgent.setup) {
        await handleApiPost(
          '/opsidata/clients/agent',
          createClient.value.initialSetup.opsiClientAgent
        )
      }
      if (createClient.value.initialSetup.netbootProducts?.length > 0) {
        await handleApiPost('/opsidata/clients/products', {
          clientIds: [createClient.value.basics.hostId],
          productIds: [createClient.value.initialSetup.netbootProducts],
          actionRequest: 'setup',
        })
      }
      clientIDList.value.push(createClient.value.basics.hostId)
    }
    isLoading.value = false
  }

  async function handleApiPost(url: string, data: any) {
    const { error } = await useApiPOST(url, data)
    if (error) {
      notifyError({ message: error?.response?.data?.message })
    }
  }

  function resetForm() {
    createClient.value = getDefaultCreateClient()
  }

  function getDefaultCreateClient(): IClientObject {
    return {
      basics: {
        hostId: '',
        description: '',
        inventoryNumber: '',
        hardwareAddress: '',
        ipAddress: null,
        notes: '',
      },
      assignments: {
        depot: '',
        groups: [],
      },
      initialSetup: {
        netbootProducts: [],
        opsiClientAgent: {
          setup: false,
          username: '',
          password: '',
          type: 'windows',
        },
      },
    } as IClientObject
  }
</script>
