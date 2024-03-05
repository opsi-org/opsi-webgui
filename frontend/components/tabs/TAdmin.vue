<template>
  <el-tabs lazy>
    <el-tab-pane :label="$t('form.general')" v-loading="isLoading">
      <div v-for="(actions, section) in groupActions.general" :key="section">
        <el-row class="mt-2 mb-2 text-small">
          <b :class="['title' + section]">{{ $t('title.' + section) }}</b>
          <el-alert v-if="section === 'clients' && !hasBlockedClients" :title="$t('message.warning.noBlockedClients')" type="warning" :closable="false" />
          <el-alert v-if="section === 'products' && !hasLockedProducts" :title="$t('message.warning.noLockedProducts')" type="warning" :closable="false" />
        </el-row>
        <el-form :label-width="mq.isMobile.value ? '': '230px'" :label-position="mq.isMobile.value ? 'top': 'right'">
          <el-form-item
            v-for="(action, index) in actions"
            :key="index"
            :label="$t('label.' + section + '.' + action)"
            variant="longvalue"
          >
            <el-input-group :style="mq.isMobile.value ?'': 'display: flex; align-items: center;'">
              <el-select v-if="action === 'unlock' || action === 'unblock'" style="min-width: 200px;" v-model="selected[section]">
                <el-option
                  v-for="item in section === 'clients' ? (blockedClients ? Object.keys(blockedClients) : []) : (lockedProducts ? Object.keys(lockedProducts) : [])"
                  :key="item"
                  :label="item + ' : ' + (section === 'clients' ? (blockedClients ? blockedClients[item] : '') : (lockedProducts ? lockedProducts[item] : ''))"
                  :value="item"
                />
              </el-select>
              <el-button type="primary" :disabled="(action === 'unblock' || action === 'unlock') && selected[section] == ''" @click="applyAction(action)">
                {{ $t('label.' + action) }}
              </el-button>
            </el-input-group>
          </el-form-item>
        </el-form>
      </div>
    </el-tab-pane>
    <el-tab-pane :label="$t('label.maintenance')">
      {{ $t('label.maintenance') }}
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/mixins/useComponent';
const mq = useMQ()
const selected = ref(
  {
    clients: '',
    products: ''
  }
)
const blockedClients = ref()
const lockedProducts = ref()
const isLoading = ref(false)
const groupActions = reactive({
  general: {
    clients: ['unblock', 'unblockAll'],
    products: ['unlock', 'unlockAll']
  },
  maintenance: {
    applicationState : ['current', 'setup'],
    createBackup : {
      config_files: true,
      redis_data:true,
      maintenance_mode: false,
      password: ''
    },
    restoreBackup : {
      file_id: '',
      config_files: false,
      redis_data:false,
      server_id: '',
      password: ''
    },
  }
})

const hasBlockedClients = computed(() => {
  return blockedClients.value && Object.keys(blockedClients.value).length > 0
})

const hasLockedProducts = computed(() => {
  return lockedProducts.value && Object.keys(lockedProducts.value).length > 0
})

onMounted(async ()=> {
  isLoading.value = true
  await fetchBlockedClients()
  await fetchLockedProducts()
  isLoading.value = false
})

async function fetchBlockedClients() {
  const {data, error } = await useApiGET('/opsidata/blocked-clients')
  if (error) {
    useNotification().error(error)
    return
  }
  blockedClients.value = data.value
}

async function fetchLockedProducts() {
  const {data, error } = await useApiGET('/opsidata/locked-products')
  if (error) {
    useNotification().error(error)
    return
  }
  lockedProducts.value = data.value
}

async function applyAction(action: string) {
  try {
    if (action === 'unblock') {
      await useApiPOST(`/opsidata/clients/${selected.value.clients}/unblock`)
      await fetchBlockedClients()
    } else if (action === 'unblockAll') {
      await useApiPOST('/opsidata/clients/unblock')
      await fetchBlockedClients()
    } else if (action === 'unlock') {
      await useApiPOST(`/opsidata/products/${selected.value.products}/unlock`)
      await fetchLockedProducts()
    } else if (action === 'unlockAll') {
      await useApiPOST('/opsidata/products/unlock')
      await fetchLockedProducts()
    }
    selected.value = { clients: '', products: '' }
  } catch (error) {
    useNotification().error(error)
  }
}
</script>
