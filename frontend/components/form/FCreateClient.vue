<template>
  <el-form
    :label-width="mq.isMobile.value ? '' : '230px'"
    :label-position="mq.isMobile.value ? 'top' : 'right'"
    v-loading="isLoading"
  >
    <div v-for="(options, category, index) in createClient" :key="index">
      <el-row>
        <b>{{ $t('title.' + category) }} </b>
      </el-row>
      <div v-for="(value, label) in options" :key="label + value">
        <el-form-item :label="$t('table.fields.' + label)">
          <el-form
            v-if="label === 'opsiClientAgent'"
            :inline="true"
            label-position="top"
          >
            <div
              v-for="(value2, label2) in createClient.initialSetup
                .opsiClientAgent"
              :key="label2 + value2"
            >
              <el-checkbox
                v-if="typeof value2 == 'boolean'"
                v-model="
                  createClient.initialSetup.opsiClientAgent[label2.toString()]
                "
              />
              <el-form-item
                v-else
                :label="$t('form.' + label)"
                :class="{
                  'd-none': !createClient.initialSetup.opsiClientAgent.setup,
                }"
              >
                <el-select
                  v-if="label2 === 'type'"
                  filterable
                  v-model="
                    createClient.initialSetup.opsiClientAgent[label2.toString()]
                  "
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
                  v-model="
                    createClient.initialSetup.opsiClientAgent[label2.toString()]
                  "
                  show-password
                />
                <el-input
                  v-else
                  v-model="
                    createClient.initialSetup.opsiClientAgent[label2.toString()]
                  "
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
            <el-option
              v-for="item in depotIDList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
          <el-select
            v-else-if="label === 'group'"
            filterable
            v-model="createClient.assignments.group"
            clearable
          >
            <el-option
              v-for="item in groupList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>

          <el-select
            v-else-if="label === 'netbootProduct'"
            filterable
            v-model="createClient.initialSetup.netbootProduct"
            clearable
          >
            <el-option
              v-for="item in netbootProductList"
              :key="item"
              :label="item"
              :value="item"
            />
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
          <el-input
            v-else
            v-model="createClient[category][label]"
            :data-testid="label"
          />
        </el-form-item>
      </div>
    </div>
    <el-form-item>
      <el-button @click="resetForm()"> {{ $t('button.reset') }}</el-button>
      <el-button
        data-testid="clientCreate_addButton"
        type="primary"
        :disabled="!clientName"
        @click="createOpsiClient"
        >{{ $t('button.create') }}</el-button
      >
    </el-form-item>
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
      group: string[]
    }
    initialSetup: {
      netbootProduct: string[]
      opsiClientAgent: IObjectString2Any
    }
    // settings: {
    //   uefi: boolean
    // }
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

  const createClient = ref<IClientObject>(getDefaultCreateClient())

  onMounted(async () => {
    await fetchInitialData()
  })

  watch(
    () => createClient.value.assignments.depot,
    async () => {
      await fetchDepotSpecificData()
    },
  )

  async function fetchInitialData() {
    const opsiconfigserver = storeCache().opsiconfigserver
    domain.value = opsiconfigserver.substring(opsiconfigserver.indexOf('.'))
    createClient.value.assignments.depot = opsiconfigserver
    await fetchDepotSpecificData()
    await fetchGroups()
  }

  async function fetchDepotSpecificData() {
    depotIDList.value = await useDepot($t).getDepotIdList()
    clientIDList.value = await useClient().getClientIdList([
      createClient.value.assignments.depot,
    ])
    await fetchNetbootProducts()
  }

  async function fetchGroups() {
    const { data, error } = await useApiGET('/opsidata/hosts/groups/id')
    if (error) {
      notifyError({ message: error?.response?.data?.message })
    } else {
      groupList.value = data.value
    }
  }

  async function fetchNetbootProducts() {
    const depot =
      createClient.value.assignments.depot !== ''
        ? createClient.value.assignments.depot
        : storeCache().opsiconfigserver
    await useApiGET(`/opsidata/depots/products?selectedDepots=[${depot}]`)
      .then((response) => {
        if (Array.isArray(response.data.value)) {
          netbootProductList.value = response.data.value.map(
            (item: T_Product) => item.productId,
          )
        }
      })
      .catch((error) => {
        notifyError({ message: error?.response?.data?.message })
      })
  }

  async function createOpsiClient() {
    createClient.value.basics.hostId = `${clientName.value}${domain.value}`
    if (clientIDList.value.includes(createClient.value.basics.hostId)) {
      notifyError({
        message: $t('message.error.clientExists', {
          client: createClient.value.basics.hostId,
        }),
      })
      return
    }
    isLoading.value = true
    const request = {
      client: createClient.value.basics,
      depot: createClient.value.assignments.depot,
    }
    const { error } = await useApiPOST<T_ClientAttr>(
      '/opsidata/clients',
      request,
    )

    if (error) {
      notifyError({ message: error?.response?.data?.message })
      return
    } else {
      notifySuccess({
        message: $t('message.success.createClient', {
          client: createClient.value.basics.hostId,
        }),
      })
      // if (createClient.value.settings.uefi) {
      //   await handleApiPost('/opsidata/clients/uefi', {
      //     clientId: createClient.value.basics.hostId,
      //     uefi: createClient.value.settings.uefi.toString(),
      //   })
      // }

      if (createClient.value.assignments.group?.length > 0) {
        await handleApiPost(
          `/opsidata/clients/${createClient.value.basics.hostId}/groups`,
          [createClient.value.assignments.group],
        )
      }
      if (createClient.value.initialSetup.opsiClientAgent.setup) {
        await handleApiPost(
          '/opsidata/clients/agent',
          createClient.value.initialSetup.opsiClientAgent,
        )
      }
      if (createClient.value.initialSetup.netbootProduct?.length > 0) {
        await handleApiPost('/opsidata/clients/products', {
          clientIds: [createClient.value.basics.hostId],
          productIds: [createClient.value.initialSetup.netbootProduct],
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
        group: [],
      },
      initialSetup: {
        netbootProduct: [],
        opsiClientAgent: {
          setup: false,
          // clients: [],
          username: '',
          password: '',
          type: 'windows',
        },
      },
      // settings: {
      //   uefi: false,
      // },
    } as IClientObject
  }
</script>
