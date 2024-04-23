<template>
  <el-form :label-width="mq.isMobile.value ? '': '230px'" :label-position="mq.isMobile.value ? 'top': 'right'" v-loading="isLoading">
    <div v-for="options,category,index in createClient" :key="index">
      <el-row>
        <b>{{ $t('title.' + category) }} </b>
      </el-row>
      <div v-for="(value, label, index) in options">
        <el-form-item :label="$t('table.fields.' + label)">
          <el-form
            v-if="label === 'opsiClientAgent'"
            :inline="true"
            label-position="top"
          >
            <div v-for="(value, label, index) in createClient.initialSetup.opsiClientAgent">
              <el-checkbox v-if="typeof value == 'boolean'" v-model="createClient.initialSetup.opsiClientAgent[label.toString()]" />
              <el-form-item v-else  :label="$t('form.' + label)" :class="{'d-none' : !createClient.initialSetup.opsiClientAgent.setup}">
                <el-select v-if="label === 'type'" filterable v-model="createClient.initialSetup.opsiClientAgent[label.toString()]">
                  <el-option
                    v-for="item in ['windows', 'linux', 'mac']"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
                <el-input v-else v-model="createClient.initialSetup.opsiClientAgent[label.toString()]" />
              </el-form-item>
            </div>
          </el-form>
          <el-select v-else-if="label === 'depot'" filterable v-model="createClient.assignments.depot">
            <el-option
              v-for="item in depotIDList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
          <el-select v-else-if="label === 'group'" filterable v-model="createClient.assignments.group">
            <el-option
              v-for="item in groupList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>

          <el-select v-else-if="label === 'netbootProduct'" filterable v-model="createClient.initialSetup.netbootProduct">
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
          <el-checkbox v-else-if="typeof value == 'boolean'" v-model="createClient[category][label]" />
          <el-input v-else v-model="createClient[category][label]" :data-testid="label"/>
        </el-form-item>
      </div>
    </div>
    <el-form-item>
      <el-button @click="resetForm()"> {{ $t('button.reset') }}</el-button>
      <el-button data-testid="clientCreate_addButton" type="primary" :disabled="!clientName" @click="createOpsiClient">{{ $t('button.create') }}</el-button>
    </el-form-item>
  </el-form>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useNotification } from '~/composables/mixins/useComponent';
import { useDepot, useClient } from '~/composables/mixins/useGet';
import type { T_ClientAttr, T_DepotIds, T_Product } from '~/types/APItypes';
const mq = useMQ()
const $t = useI18n().t
const notify = useNotification($t)
const isLoading = ref(false)
const depotIDList = ref<T_DepotIds>([])
const clientIDList = ref()
const netbootProductList = ref()
const groupList = ref()
const clientName = ref('')
const domain = ref('')
  // TODO: Backend: change createClient data structure
const createClient = reactive({
  basics: {
    hostId: '',
    description: '',
    inventoryNumber: '',
    hardwareAddress: '',
    ipAddress: null,
    notes: ''
  },
  assignments: {
    depot: "",
    group: []
  },
  initialSetup: {
    netbootProduct: [],
    opsiClientAgent: {
      setup: false,
      username: '',
      password: '',
      type: 'windows'
    }
  },
  settings: {
    uefi: false
  }
})
onMounted(async ()=> {
  await fetch()
  domain.value = storeCache().opsiconfigserver.substring(storeCache().opsiconfigserver.indexOf('.'))
  createClient.assignments.depot = storeCache().opsiconfigserver
})
watch(()=>createClient.assignments.depot, async ()=>{
  await fetchNetbootProducts()
  clientIDList.value = await useClient($t).getClientIdList([createClient.assignments.depot])
})
async function fetch() {
  depotIDList.value = await useDepot($t).getDepotIdList()
  clientIDList.value = await useClient($t).getClientIdList([createClient.assignments.depot])
  await fetchNetbootProducts()
  await fetchGroups()
}

async function fetchGroups() {
  const {data, error } = await useApiGET('/opsidata/hosts/groups/id')
  if (error) {
    notify.error(error)
  } else {
    groupList.value = data.value
  }
}

async function fetchNetbootProducts() {
  let depot = ''
  if (createClient.assignments.depot !== '') {
    depot = createClient.assignments.depot
  } else {
    depot = storeCache().opsiconfigserver
  }
  await useApiGET('/opsidata/depots/products?selectedDepots=[' + depot + ']')
    .then((response) => {
      if (Array.isArray(response.data.value)) {
        netbootProductList.value = response.data.value.map((item: T_Product) => item.productId)
      }
    }).catch((error) => {
      notify.error(error)
    })
}

async function createOpsiClient() {
  createClient.basics.hostId =  clientName.value + domain.value
  if (clientIDList.value.includes(createClient.basics.hostId)) {
    notify.error($t('message.error.clientExists', { client: createClient.basics.hostId }))
    return
  }
  isLoading.value = true
  const request = {
    client: createClient.basics, depot: createClient.assignments.depot
  }
  const { error } = await useApiPOST<T_ClientAttr>('/opsidata/clients', request)

  if (error) {
    notify.error(error)
    return
  } else {
    notify.success($t('message.success.createClient', { client: createClient.basics.hostId }))
    if (createClient.settings.uefi) {
      setUEFI(createClient.basics.hostId, createClient.settings.uefi.toString())
    }
    if (createClient.assignments.group) {
      await assignToGroup()
    }
    if (createClient.initialSetup.opsiClientAgent.setup) {
      await deployopsiclientagent()
    }
    if (createClient.initialSetup.netbootProduct) {
      await setupNetbootProduct()
    }
    clientIDList.value.push(createClient.basics.hostId)
  }
  isLoading.value = false
}

async function setUEFI(clientId: string, uefi: string) {
  const { error } = await useApiPOST('/opsidata/clients/uefi', {clientId, uefi})
  if (error) {
    useNotification($t).error(error)
  }
}

async function assignToGroup() {
  const { error } = await useApiPOST('/opsidata/clients/groups', {clientId: createClient.basics.hostId, group: createClient.assignments.group})
  if (error) {
    useNotification($t).error(error)
  }
}

async function deployopsiclientagent() {
  const { error } = await useApiPOST('/opsidata/clients/agent', createClient.initialSetup.opsiClientAgent)
  if (error) {
    useNotification($t).error(error)
  }
}

async function setupNetbootProduct() {
  const { error } = await useApiPOST('/opsidata/clients/netboot', {clientIds: [createClient.basics.hostId], productIds: [createClient.initialSetup.netbootProduct], actionRequest: 'setup'})
  if (error) {
    useNotification($t).error(error)
  }
}

function resetForm () {
  Object.assign(createClient, {
    basics: {
      hostId: '',
      description: '',
      inventoryNumber: '',
      hardwareAddress: '',
      ipAddress: null,
      notes: ''
    },
    assignments: {
      depot: "",
      group: []
    },
    initialSetup: {
      netbootProduct: [],
      opsiClientAgent: {
        setup: false,
        clients: [],
        username: '',
        password: '',
        type: 'windows'
      }
    },
    settings: {
      uefi: false
    }
  })
}
</script>


