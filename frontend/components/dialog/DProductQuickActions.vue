<template>
  <div>
  <el-button plain @click="popoverVisible = true">
    <IconIIcon :icon="icon.product" />
  </el-button>
  <el-dialog v-model="popoverVisible">
    <template #header>
      <h5>{{ $t('label.prodquickaction') }}</h5>
    </template>
    <IconILoading v-if="isLoadingMain" :is-loading="isLoadingMain" />
    <el-form v-else :label-width="mq.isMobile.value ? '' : '300px'" :label-position="mq.isMobile.value ? 'top' : 'right'">
      <div v-for="(options, category, index) in productActions" :key="index">
        <el-row>
          <b>{{ $t('title.' + category) }} </b>
          <ButtonBTNHelpTooltip v-if="$t('title.' + category+'.help.content') !== 'title.' + category+'.help.content'" :content="$t('title.' + category+'.help.content')" />
        </el-row>
        <div v-for="(value, label) in options" :key="label + value">
          <el-alert v-if="label == 'demoInfo'" :title="value" type="info" :closable="false" />
          <el-form-item v-else :label="$t('table.fields.' + label)">

            <div v-if="label == 'demoResult'" class="max-h-64 min-w-full overflow-y-auto">
              <IconILoading v-if="isLoadingDemo" :is-loading="isLoadingDemo" inline/>
              <div v-else-if="productActions.demo.demoResult == undefined" > -- </div>
              <div v-else-if="Object.keys(productActions.demo.demoResult).length == 0" > no results </div>
              <div v-else v-for="k in Object.keys(productActions.demo.demoResult).sort()" :key="k">
                <el-collapse v-model="activeName" accordion>
                  <el-collapse-item :title="k" :name="k">
                    <span
                      v-for="item, iindex in (productActions.demo.demoResult as any)[k]"
                      :key="item + iindex"
                      class="flex flex-row justify-between"
                    >
                      <p>{{ item.productId }}</p>
                      <p>{{ item.productType }}</p>
                      <p>{{ item.productVersion }}- {{ item.packageVersion }}</p>
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
              @change="() => { executeAction(true) }"
            >
              <el-option v-for="item in (value as any).options.sort(mysort)" :key="item || NO_VALUE" :label="item ? item : NO_VALUE" :value="item || NO_VALUE" />
            </el-select>
            <div v-else>
              {{ value }}
            </div>
          </el-form-item>
        </div>
      </div>

      <el-form-item>
        <el-button> {{ $t('button.reset') }}</el-button>
        <el-button :disabled="productActions.demo.demoResult == undefined" type="primary" @click="executeAction(true)">{{ $t('button.apply') }}</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</div>
</template>


<script setup lang="ts">
  import { useIcons } from '@/composables/mixins/useIcons'
  import { isObject } from '@/utils/scompares'
  import { useNotification } from '~/composables/mixins/useComponent';
  const { notifySuccess, notifyError } = useNotification()
  const $t = useI18n().t
  const icon = useIcons()
  const mq = useMQ()
  const storeSelection: any = storeSelections()
  const popoverVisible = ref(false)
  const isLoadingMain = ref(true)
  const isLoadingDemo = ref(false)
  const activeName = ref("")
  const NOT_APPLIED = $t('label.noselection')
  const NO_VALUE = $t('label.novalue')

  const productActions = ref({
    // to add a help button with tooltip after the category title, simply add translation key: title.<category>.help.content to the english translation file (example title.conditions.help.content)
    conditions: {
      instStatus: {
        value: NOT_APPLIED,
        options: ['not_installed', 'installed', 'unknown'], // will be fetched from backend. its just the default values
      },
      actionResult: {
        value: NOT_APPLIED,
        options: [null, 'null', 'failed', 'successful', 'none'], // will be fetched from backend. its just the default values
      },
      outdatedonclient: false,
    },
    possibleActions: {
      rowactions: {
        options: ['none', 'setup', 'uninstall', 'update', 'once', 'always', 'custom'],
        value: NOT_APPLIED,
      }
    },
    scope: {
      apply: {
        options: [
          // future: add server and both
          $t('label.quickaction.scope.options.both'),
          $t('label.quickaction.scope.options.server'),
          $t('label.quickaction.scope.options.clients')
        ],
        value: $t('label.quickaction.scope.options.clients')
      }
    },
    demo: {
      demoInfo: $t('label.quickaction.demo.info'),
      demoResult: undefined,
    },
  })

  watch(() => popoverVisible.value, async (value) => {
    if (value) {
      await fetchActionResults()
      await fetchInstallationStates()
      isLoadingMain.value = false

    }
  })

  function mysort (a: string, b: string): number {
    const aa = (a === null) ? NO_VALUE : a
    const bb = (b === null) ? NO_VALUE : b
    return aa.localeCompare(bb)
  }

  async function fetchActionResults () {
    const {data, error } = await useApiGET<Array<string>>('/opsidata/products/action-result')
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      return
    }
    if (data.value) {
      productActions.value.conditions.actionResult.options = [...data.value, NOT_APPLIED]
      productActions.value.conditions.actionResult.value = NOT_APPLIED
      // productActions.value.conditions.actionResult.value = productActions.value.conditions.actionResult.value.filter(item => productActions.value.conditions.actionResult.options.includes(item))

    } else {
      throw new Error('No action results found: ' + JSON.stringify(data.value))
    }
  }
  async function fetchInstallationStates () {
    const {data, error } = await useApiGET<Array<string>>('/opsidata/products/installation-status')
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      return
    }
    if (data.value) {
      productActions.value.conditions.instStatus.options = [...data.value, NOT_APPLIED]
      productActions.value.conditions.instStatus.value = NOT_APPLIED
      // productActions.value.conditions.instStatus.value = productActions.value.conditions.instStatus.value.filter(item => productActions.value.conditions.instStatus.options.includes(item))
    } else {
      throw new Error('No installation states found ' + JSON.stringify(data.value))
    }
  }

  function get_params (demoMode: boolean) {
    const includeClients = [$t('label.quickaction.scope.options.both'), $t('label.quickaction.scope.options.clients')].includes(productActions.value.scope.apply.value)
    const includeServer = [$t('label.quickaction.scope.options.both'), $t('label.quickaction.scope.options.server')].includes(productActions.value.scope.apply.value)
    // const demoMode = demo //|| productActions.value.demo.demoMode
    const params: Record<string, any> = {
      action: productActions.value.possibleActions.rowactions.value || '',
      outdated: productActions.value.conditions.outdatedonclient,
      installation_status: productActions.value.conditions.instStatus.value,
      action_result: productActions.value.conditions.actionResult.value,
      demoMode: demoMode
    }

    params.selectedClients = (includeClients) ? storeSelection.selectionClients : null
    params.selectedDepots = (includeServer) ? storeSelection.selectionDepots : null
    // params.selectedClients = null
    // params.selectedDepots = null
    // if (includeClients) {
    // }
    // if (includeServer) {
    //   params.selectedDepots = storeSelection.selectionDepots
    // }
    //   const params = { ...this.quickaction, demoMode: demo }
    //   const ref = (this.$refs.prodQuickActionAlert as any)
    //   console.log(params)
      if ((params.outdated === false && params.installation_status === null && params.action_result === null) ||
          (params.outdated === false && params.installation_status === NOT_APPLIED && params.action_result === NOT_APPLIED)){
        productActions.value.demo.demoResult = undefined
        return
      } else if (params.action === NOT_APPLIED && demoMode === false) {
        notifyError({title: $t('message.error.productquickaction')})
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
  async function executeAction(demo: boolean=true) {
    isLoadingDemo.value = true
    productActions.value.demo.demoResult = undefined
    const params = get_params(demo)
    if (!params) {
      productActions.value.demo.demoResult = undefined
      isLoadingDemo.value = false
      return
    }


    const  {data, error} = await useApiPOST('/opsidata/clients/action', params)
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      productActions.value.demo.demoResult = undefined
      isLoadingDemo.value = false
      return
    }
    if (data.value) {
      productActions.value.demo.demoResult = data.value as any
      if (!demo) {
        notifySuccess({ message: $t('message.success.save.productactions') })
      }
      isLoadingDemo.value = false
    } else {
      isLoadingDemo.value = false
      throw new Error('No installation states found ' + JSON.stringify(data.value))
    }
  }
</script>