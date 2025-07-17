<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div>
    <TooltipTTooltip :content="$t('productQuickActions')">
      <el-button plain @click="popoverVisible = true">
        <IconIIcon :icon="icon.product" />
      </el-button>
    </TooltipTTooltip>
    <el-dialog v-model="popoverVisible">
      <template #header>
        <h5>{{ $t('productQuickActions') }}</h5>
      </template>
      <el-form
        v-loading="isLoadingMain || isLoadingDemo"
        label-width="30%"
        :label-position="mq.isMobile.value ? 'top' : 'left'"
      >
        <div v-for="(options, category, index) in productActions" :key="index">
          <el-row>
            <b>{{ $t(category) }} </b>
            <ButtonBTNHelpTooltip
              v-if="$t(category + '.help') !== category + '.help'"
              :content="$t(category + '.help')"
            />
          </el-row>
          <div v-for="(value, label) in options" :key="label + value">
            <el-alert
              v-if="label == 'demoHelp'"
              :title="value"
              type="info"
              show-icon
              :closable="false"
            />
            <el-form-item v-else :label="$t(label)">
              <div v-if="label == 'demoResult'" class="max-h-64 min-w-full overflow-y-auto">
                <div v-if="productActions.demo.demoResult == undefined">
                  {{ EMPTY }}
                </div>
                <div v-else-if="Object.keys(productActions.demo.demoResult).length == 0">
                  {{ $t('message.noResponse') }}
                </div>
                <div
                  v-else
                  v-for="k in Object.keys(productActions.demo.demoResult).sort()"
                  :key="k"
                >
                  <el-collapse v-model="activeName" accordion>
                    <el-collapse-item :title="k" :name="k">
                      <span
                        v-for="(item, iindex) in (productActions.demo.demoResult as any)[k]"
                        :key="item + iindex"
                        class="flex flex-row justify-between"
                      >
                        <p>{{ item.productId }}</p>
                        <p>{{ item.productType }}</p>
                        <p>
                          {{ item.productVersion }}
                          <span class="after:content-['-']" />
                          {{ item.packageVersion }}
                        </p>
                        <p>{{ item.actionRequest }}</p>
                        <p>{{ item.installationStatus }}</p>
                      </span>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </div>

              <el-checkbox
                v-else-if="typeof value == 'boolean'"
                v-model="productActions[category][label]"
                @update:model-value="executeAction(true)"
              />

              <el-select
                v-else-if="isObject(value)"
                v-model="(productActions[category][label] as any).value"
                :multiple="Array.isArray((productActions[category][label] as any).value)"
                :disable="(productActions[category][label] as any).options.length <= 1"
                @change="
                  () => {
                    executeAction(true)
                  }
                "
              >
                <el-option
                  v-for="item in (value as any).options.sort(mysort)"
                  :key="item || NO_VALUE"
                  :label="item ? item : NO_VALUE"
                  :value="item || NO_VALUE"
                />
              </el-select>
              <div v-else>
                {{ value }}
              </div>
            </el-form-item>
          </div>
        </div>

        <div class="button-container" style="display: flex; justify-content: flex-end">
          <el-button> {{ $t('reset') }}</el-button>
          <el-button
            :disabled="productActions.demo.demoResult == undefined"
            :type="productActions.demo.demoResult == undefined ? '' : 'success'"
            @click="executeAction(true)"
            >{{ $t('apply') }}</el-button
          >
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { isObject } from '@/utils/scompares'
  import { useNotification } from '~/composables/mixins/useComponent'
  const { notifySuccess, notifyError } = useNotification()
  const $t = useI18n().t
  const icon = useIcons()
  const mq = useMQ()
  const storeSelection: any = storeSelections()
  const popoverVisible = ref(false)
  const isLoadingMain = ref(true)
  const isLoadingDemo = ref(false)
  const activeName = ref('')
  const NOT_APPLIED = $t('notApplied')
  const NO_VALUE = $t('nullValue')
  const EMPTY = '--'

  const productActions = ref({
    conditions: {
      // $t('conditions.help')
      instStatus: {
        options: ['not_installed', 'installed', 'unknown'], // will be fetched from backend. its just the default values
        value: NOT_APPLIED,
      },
      actionResult: {
        options: [null, 'null', 'failed', 'successful', 'none'], // will be fetched from backend. its just the default values
        value: NOT_APPLIED,
      },
      outdatedOnClient: false,
    },
    possibleActions: {
      rowactions: {
        options: ['none', 'setup', 'uninstall', 'update', 'once', 'always', 'custom'],
        value: NOT_APPLIED,
      },
    },
    scope: {
      apply: {
        options: [
          $t('toBothSelectedServersAndClients'),
          $t('toSelectedServers'),
          $t('toSelectedClients'),
        ],
        value: $t('toSelectedClients'),
      },
    },
    demo: {
      demoHelp: $t('demoHelp'),
      demoResult: undefined,
    },
  })

  watch(
    () => popoverVisible.value,
    async (value) => {
      if (value) {
        await fetchActionResults()
        await fetchInstallationStates()
        isLoadingMain.value = false
      }
    }
  )

  function mysort(a: string, b: string): number {
    const aa = a === null ? NO_VALUE : a
    const bb = b === null ? NO_VALUE : b
    return aa.toString().localeCompare(bb)
  }

  async function fetchActionResults() {
    const { data, error } = await useApiGET<Array<string>>('/opsidata/products/action-result')
    if (error) {
      return
    }
    if (data.value) {
      productActions.value.conditions.actionResult.options = [...data.value, NOT_APPLIED]
      productActions.value.conditions.actionResult.value = NOT_APPLIED
    } else {
      throw new Error($t('message.noActionResults') + JSON.stringify(data.value))
    }
  }
  async function fetchInstallationStates() {
    const { data, error } = await useApiGET<Array<string>>('/opsidata/products/installation-status')
    if (error) {
      return
    }
    if (data.value) {
      productActions.value.conditions.instStatus.options = [...data.value, NOT_APPLIED]
      productActions.value.conditions.instStatus.value = NOT_APPLIED
    } else {
      throw new Error($t('message.noInstallationStatuses') + JSON.stringify(data.value))
    }
  }

  function get_params(demoMode: boolean) {
    const includeClients = [
      $t('toBothSelectedServersAndClients'),
      $t('toSelectedClients'),
    ].includes(productActions.value.scope.apply.value)
    const includeServer = [$t('toBothSelectedServersAndClients'), $t('toSelectedServers')].includes(
      productActions.value.scope.apply.value
    )

    const params: Record<string, any> = {
      action: productActions.value.possibleActions.rowactions.value || '',
      outdated: productActions.value.conditions.outdatedOnClient,
      installation_status: productActions.value.conditions.instStatus.value,
      action_result: productActions.value.conditions.actionResult.value,
      demoMode: demoMode,
    }

    params.selectedClients = includeClients ? storeSelection.selectionClients : null
    params.selectedDepots = includeServer ? storeSelection.selectionDepots : null

    if (
      (params.outdated === false &&
        params.installation_status === null &&
        params.action_result === null) ||
      (params.outdated === false &&
        params.installation_status === NOT_APPLIED &&
        params.action_result === NOT_APPLIED)
    ) {
      productActions.value.demo.demoResult = undefined
      return
    } else if (params.action === NOT_APPLIED && demoMode === false) {
      notifyError({ title: $t('message.chooseAction') })
    } else if (params.action === NOT_APPLIED && demoMode === true) {
      params.action = ''
    }
    if (params.installation_status === NOT_APPLIED) {
      params.installation_status = null
    }
    if (params.action_result === NOT_APPLIED) {
      params.action_result = null
    }
    return params
  }
  async function executeAction(demo: boolean = true) {
    isLoadingDemo.value = true
    productActions.value.demo.demoResult = undefined
    const params = get_params(demo)
    if (!params) {
      productActions.value.demo.demoResult = undefined
      isLoadingDemo.value = false
      return
    }

    const { data, error } = await useApiPOST('/opsidata/clients/action', params)
    if (error) {
      productActions.value.demo.demoResult = undefined
      isLoadingDemo.value = false
      return
    }
    if (data.value) {
      productActions.value.demo.demoResult = data.value as any
      if (!demo) {
        notifySuccess({ message: $t('message.actionApplied') })
      }
      isLoadingDemo.value = false
    } else {
      isLoadingDemo.value = false
      throw new Error($t('message.installationStatusNotFound') + ': ' + JSON.stringify(data.value))
    }
  }
</script>
