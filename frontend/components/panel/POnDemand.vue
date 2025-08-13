<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <p-panel :header="$t('processActionsRequest')">
    <el-form
      :label-position="mq.isMobile.value ? 'top' : 'left'"
      label-width="30%"
      v-loading="isLoading"
    >
      <el-form-item :label="$t('products')">
        <el-radio-group v-model="selectedProductMode">
          <el-radio :value="KEYS.ALL">{{ $t('allProducts') }}</el-radio>
          <el-radio v-if="props.productIds" :value="KEYS.PASSED">{{
            $t('listedProducts')
          }}</el-radio>
          <TooltipTTooltip
            :content="$t('message.selectProductsToEnableThisOption')"
            :disabled="storeSelection.selectionProducts.length > 0"
          >
            <el-radio
              :value="KEYS.SELECTED"
              :disabled="storeSelection.selectionProducts.length < 1"
            >
              {{ $t('onlySelectedProducts') }}
            </el-radio>
          </TooltipTTooltip>
        </el-radio-group>
        <PanelPList :data="visibleProductIds" />
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
    <!-- if withFooter-->

    <template v-if="props.withFooter">
      <div class="!dialog-footer">
        <TooltipTTooltip
          :content="
            storeSelection.selectionClients.length < 1
              ? $t('message.selectClientsToProcessActions')
              : $t('processActions.help')
          "
        >
          <el-button
            :disabled="storeSelection.selectionClients.length < 1"
            @click="executeOnDemand"
          >
            {{ props.title || $t('onDemand') }}
          </el-button>
        </TooltipTTooltip>
      </div>
    </template>
  </p-panel>
</template>

<script setup lang="ts">
  import { useNotification } from '~/composables/mixins/useComponent'

  const thisInstance = getCurrentInstance()
  const { notifyInfo } = useNotification()
  const KEYS = {
    ALL: 'All',
    PASSED: 'Passed',
    SELECTED: 'Selected',
  }
  const mq = useMQ()
  const $t = useI18n().t
  const storeSelection = storeSelections()
  const isLoading = ref(false)
  const selectedProductMode = ref(KEYS.ALL)

  const emit = defineEmits(['pre-action'])
  const props = defineProps({
    withFooter: { type: Boolean, default: true },
    productIds: { type: Array as PropType<string[]>, required: false },
    title: { type: String, required: false },
  })
  const processActions = ref({
    client_ids: storeSelection.selectionClients,
    product_ids: [] as string[],
    visibility: undefined as true | false | undefined,
  })

  const emitPreActionExists = computed(() => {
    return (
      thisInstance?.vnode?.props?.preAction !== undefined ||
      thisInstance?.vnode?.props?.onPreAction !== undefined
    )
  })
  const visibleProductIds = computed(() => {
    if (selectedProductMode.value === KEYS.ALL) {
      return []
    } else if (selectedProductMode.value === KEYS.PASSED) {
      return props.productIds || []
    } else if (selectedProductMode.value === KEYS.SELECTED) {
      return storeSelection.selectionProducts
    }
    return []
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

  async function executeOnDemand() {
    isLoading.value = true
    if (emitPreActionExists) {
      await emit('pre-action')
    }
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
    if (selectedProductMode.value !== KEYS.ALL) {
      payload.product_ids = visibleProductIds.value
    }
    const { data } = await useApiPOST('/command/process_action', payload)
    isLoading.value = false
    if (data) {
      notifyInfo({ message: data.value })
    }
  }
</script>
