<template>
  <el-tooltip
    :content="
      storeSelection.selectionClients.length < 1
        ? $t('message.selectClientsToProcessActions')
        : $t('processActions.help')
    "
  >
    <el-button
      @click="openProcessActionsModal = true"
      :disabled="storeSelection.selectionClients.length < 1"
    >
      {{ $t('processActions') }}
    </el-button>
  </el-tooltip>

  <el-dialog v-model="openProcessActionsModal" :title="$t('processActions')">
    <el-form
      :label-position="mq.isMobile.value ? 'top' : 'left'"
      label-width="30%"
      v-loading="isLoading"
    >
      <el-form-item :label="$t('products')">
        <el-radio-group v-model="selectedProductMode">
          <el-radio value="All">{{ $t('allProducts') }}</el-radio>
          <el-tooltip
            :content="$t('message.selectProductsToEnableThisOption')"
            :disabled="storeSelection.selectionProducts.length > 0"
          >
            <el-radio value="Selected" :disabled="storeSelection.selectionProducts.length < 1">
              {{ $t('onlySelectedProducts') }}
            </el-radio>
          </el-tooltip>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('visiblilityOnClients')">
        <el-checkbox
          :indeterminate="processActions.visibility === undefined"
          :checked="processActions.visibility === true"
          :unchecked="processActions.visibility === false"
          @change="toggleVisibility"
        >
          {{
            processActions.visibility === true
              ? $t('visible')
              : processActions.visibility === false
                ? $t('hidden')
                : $t('clientDefault')
          }}
        </el-checkbox>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button :loading="isLoading" @click="executeProcessActions">
          {{ $t('execute') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { useNotification } from '~/composables/mixins/useComponent'

  const { notifyError, notifyInfo } = useNotification()
  const mq = useMQ()
  const $t = useI18n().t
  const storeSelection = storeSelections()

  const openProcessActionsModal = ref(false)
  const isLoading = ref(false)
  const selectedProductMode = ref('All')
  const processActions = ref({
    client_ids: storeSelection.selectionClients,
    product_ids: [] as string[],
    visibility: undefined as true | false | undefined,
  })

  function toggleVisibility() {
    if (processActions.value.visibility === undefined) {
      processActions.value.visibility = true
    } else if (processActions.value.visibility === true) {
      processActions.value.visibility = false
    } else {
      processActions.value.visibility = undefined
    }
  }

  async function executeProcessActions() {
    isLoading.value = true
    let visibility = ''
    if (processActions.value.visibility === true) {
      visibility = 'visible'
    } else if (processActions.value.visibility === false) {
      visibility = 'hidden'
    }
    const payload: Record<string, any> = {
      client_ids: storeSelection.selectionClients,
      visibility: visibility,
    }

    if (selectedProductMode.value === 'Selected') {
      payload.product_ids = storeSelection.selectionProducts
    }
    const { data, error } = await useApiPOST('/command/process_action', payload)
    openProcessActionsModal.value = false
    isLoading.value = false
    if (data) {
      notifyInfo({ message: data.value })
    }
  }
</script>
