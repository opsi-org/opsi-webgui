<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div v-loading="isLoading">
    <div v-for="(actions, section) in adminTasks" :key="section">
      <h3 class="mt-4 text-lg font-semibold">
        {{ $t('title.' + section) }}
      </h3>
      <el-form
        label-width="50%"
        :label-position="mq.isMobile.value ? 'top' : 'left'"
      >
        <el-form-item
          v-for="(action, index) in actions"
          :key="index"
          :label="$t('label.' + section + '.' + action)"
        >
          <div
            :style="
              mq.isMobile.value ? '' : 'display: flex; align-items: center;'
            "
          >
            <el-select
              v-if="action === 'unlock' || action === 'unblock'"
              style="min-width: 250px"
              v-model="selected[section]"
              :disabled="
                section == 'clients' ? !hasBlockedClients : !hasLockedProducts
              "
              :placeholder="
                section === 'clients' ? placeholderClients : placeholderProducts
              "
            >
              <el-option
                v-for="item in section === 'clients'
                  ? blockedClients
                    ? Object.keys(blockedClients)
                    : []
                  : lockedProducts
                    ? Object.keys(lockedProducts)
                    : []"
                :key="item"
                :label="
                  item +
                  ' : ' +
                  (section === 'clients'
                    ? blockedClients
                      ? blockedClients[item]
                      : ''
                    : lockedProducts
                      ? lockedProducts[item]
                      : '')
                "
                :value="item"
              />
            </el-select>
            <el-button
              :disabled="
                ((action === 'unblock' || action === 'unlock') &&
                  selected[section] == '') ||
                section == 'clients'
                  ? !hasBlockedClients
                  : !hasLockedProducts
              "
              @click="applyAction(action)"
            >
              {{ $t('label.' + action) }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useNotification } from '~/composables/mixins/useComponent'
  interface TData {
    [key: string]: string[]
  }
  const { notifyError } = useNotification()

  const $t = useI18n().t
  const adminTasks = reactive({
    clients: ['unblock', 'unblockAll'], // for translation key search: $('title.clients'), $('label.clients.unblock'), $('label.clients.unblockAll'), $('label.unblock'), $('label.unblockAll')
    products: ['unlock', 'unlockAll'], // for translation key search: $('title.products') $('label.products.unlock'), $('label.products.unlockAll'), $('label.unlock'), $('label.unlockAll')
  })
  const mq = useMQ()
  const selected = ref({
    clients: '',
    products: '',
  })
  const blockedClients = ref<TData>({})
  const lockedProducts = ref<TData>({})
  const isLoading = ref(false)

  onMounted(async () => {
    isLoading.value = true
    await fetchBlockedClients()
    await fetchLockedProducts()
    isLoading.value = false
  })

  const hasBlockedClients = computed(() => {
    return blockedClients.value && Object.keys(blockedClients.value).length > 0
  })

  const hasLockedProducts = computed(() => {
    return lockedProducts.value && Object.keys(lockedProducts.value).length > 0
  })

  const placeholderClients = computed(() => {
    const count = Object.keys(blockedClients.value || {}).length
    if (count > 0) {
      return $t('label.clients.placeholder', { count })
    }
    return $t('message.warning.noBlockedClients')
  })
  const placeholderProducts = computed(() => {
    const count = Object.keys(lockedProducts.value || {}).length
    if (count > 0) {
      return $t('label.products.placeholder', { count })
    }
    return $t('message.warning.noLockedProducts')
  })

  async function fetchBlockedClients() {
    const { data, error } = await useApiGET<TData>('/opsidata/blocked-clients')
    if (error || !data.value) {
      notifyError({
        message:
          error?.response?.data?.message || 'No blocked clients received',
      })
      return
    }
    blockedClients.value = data.value
  }

  async function fetchLockedProducts() {
    const { data, error } = await useApiGET<TData>('/opsidata/locked-products')
    if (error || !data.value) {
      notifyError({
        message:
          error?.response?.data?.message || 'No locked products received',
      })
      return
    }
    lockedProducts.value = data.value
  }

  async function applyAction(action: string) {
    isLoading.value = true
    try {
      const wasError = ref(false)
      if (action === 'unblock') {
        const { error } = await useApiPOST(
          `/opsidata/clients/${selected.value.clients}/unblock`,
        )
        if (error) {
          wasError.value = true
          notifyError({ message: error?.response?.data?.message })
        } else await fetchBlockedClients()
      } else if (action === 'unblockAll') {
        const { error } = await useApiPOST('/opsidata/clients/unblock')
        if (error) {
          wasError.value = true
          notifyError({ message: error?.response?.data?.message })
        } else await fetchBlockedClients()
      } else if (action === 'unlock') {
        const { error } = await useApiPOST(
          `/opsidata/products/${selected.value.products}/unlock`,
        )
        if (error) {
          wasError.value = true
          notifyError({ message: error?.response?.data?.message })
        } else await fetchLockedProducts()
      } else if (action === 'unlockAll') {
        const { error } = await useApiPOST('/opsidata/products/unlock')
        if (error) {
          wasError.value = true
          notifyError({ message: error?.response?.data?.message })
        } else await fetchLockedProducts()
      }
      if (!wasError.value) selected.value = { clients: '', products: '' }
    } catch (error) {
      notifyError({ message: error })
    }
    isLoading.value = false
  }
</script>
