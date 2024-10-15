<template>
  <el-button plain @click="popoverVisible = true">
    <IconIIcon :icon="icon.product" />
  </el-button>
  <el-dialog v-model="popoverVisible">
    <template #header>
      <h5>{{ $t('label.prodquickaction') }}</h5>
    </template>
    <el-form :label-width="mq.isMobile.value ? '' : '300px'" :label-position="mq.isMobile.value ? 'top' : 'right'">
      <div v-for="(options, category, index) in productActions" :key="index">
        <el-row>
          <b>{{ $t('title.' + category) }} </b>
        </el-row>
        <div v-for="(value, label) in options" :key="label + value">
          <el-alert v-if="label == 'demoInfo'" :title="value" type="info" :closable="false" />
          <el-form-item v-else :label="$t('table.fields.' + label)">
            <el-checkbox v-if="typeof value == 'boolean'" v-model="productActions[category][label]" />
            <el-select v-else-if="Array.isArray(value)" v-model="productActions[category][label]" multiple>
              <el-option v-for="item in value" :key="item" :label="item" :value="item" />
            </el-select>
            <div v-else>
              {{ value }}
            </div>
          </el-form-item>
        </div>
      </div>
      <el-form-item>
        <el-button> {{ $t('button.reset') }}</el-button>
        <el-button type="primary">{{ $t('button.apply') }}</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script setup lang="ts">
  import { useIcons } from '@/composables/mixins/useIcons'
  import { useNotification } from '~/composables/mixins/useComponent'
  const { notifySuccess, notifyError } = useNotification()
  const $t = useI18n().t
  const icon = useIcons()
  const mq = useMQ()
  const popoverVisible = ref(false)
  const productQuickAction = {
    action: null,
    outdated: false,
    installation_status: null,
    action_result: null,
    selectedClients: null,
    selectedDepots: null,
    demoMode: true,
  }
  const productActions = ref({
    conditions: {
      instStatus: ['not_installed', 'installed', 'unknown'],
      actionResult: ['null', 'failed', 'successful', 'none'],
      outdatedonclient: false,
    },
    possibleActions: {
      rowactions: ['none', 'setup', 'uninstall', 'update', 'once', 'always', 'custom'],
    },
    scope: {
      apply: ['To both selected servers and clients', 'Only to selected servers', 'Only to selected clients'],
    },
    demo: {
      demoInfo: 'Demo mode simulates product quick actions without making changes, showing expected results.',
      demoMode: true,
      demoResult: '--',
    },
  })
</script>

<!-- <template>
      <OverlayOLoading :is-loading="isLoading" />
      <GridGFormItem variant="longlabel" :label="$t('table.fields.instStatus')">
        <template #value>
          <b-form-select v-model="quickaction.installation_status" size="sm" :options="conditn_InstStatus">
            <template #first>
              <b-form-select-option :value="null">
                {{ $t('label.noselection') }}
              </b-form-select-option>
            </template>
          </b-form-select>
        </template>
      </GridGFormItem>
      <GridGFormItem variant="longlabel" :label="$t('table.fields.actionResult')">
        <template #value>
          <b-form-select v-model="quickaction.action_result" size="sm" :options="conditn_ActionResult">
            <template #first>
              <b-form-select-option :value="null">
                {{ $t('label.noselection') }}
              </b-form-select-option>
            </template>
          </b-form-select>
        </template>
      </GridGFormItem>
      <GridGFormItem variant="longlabel" :label="$t('label.pv.outdatedonclient')">
        <template #value>
          <b-form-checkbox v-model="quickaction.outdated" size="sm" />
        </template>
      </GridGFormItem>
      <b-row class="text-small mb-2">
        <b>{{ $t('label.possibleactions') }} </b>
      </b-row>
      <GridGFormItem variant="longlabel" :label="$t('table.fields.rowactions')">
        <template #value>
          <b-form-select v-model="quickaction.action" size="sm" :options="actions">
            <template #first>
              <b-form-select-option :value="null">
                {{ $t('label.noselection') }}
              </b-form-select-option>
            </template>
          </b-form-select>
        </template>
      </GridGFormItem>
      <b-row class="text-small mb-2">
        <b>{{ $t('label.restrictions') }} </b>
      </b-row>
      <GridGFormItem variant="longlabel" :label="$t('form.productaction.radio.label')">
        <template #value>
          <b-form-group>
            <b-form-radio
              v-model="radioOption"
              name="server-clients-radio"
              value="both"
              disabled
            >
              {{ $t('form.productaction.radio.both') }}
            </b-form-radio>
          </b-form-group>
        </template>
      </GridGFormItem>
      <GridGFormItem variant="longlabel">
        <template #value>
          <div class="float-right mt-4">
            <b-button id="resetButton" class="resetButton" variant="primary" size="sm" @click="resetForm()">
              {{ $t('button.reset') }}
            </b-button>
            <b-button variant="success" :disabled="quickaction.action == null || (quickaction.installation_status === null && quickaction.action_result === null)" size="sm" @click="executeAction(false)">
              {{ $t('button.apply') }}
            </b-button>
          </div>
        </template>
      </GridGFormItem>
      <GridGFormItem variant="longlabel" :label="$t('form.productaction.demoResult')">
        <template #value>
          <div v-if="demoResult && demoResult != '--'" flush>
            <div v-for="k in Object.keys(demoResult).sort()" :key="k">
              <b-button v-b-toggle="k" block class="text-left collapsebtn border-0" size="sm" variant="outline-primary">
                <b>{{ k }}</b>
              </b-button>
              <b-collapse :id="k" :visible="false">
                <span v-for="item, index in sort(demoResult[k])" :key="index">
                  <GridGFormItem
                    value-more="true"
                    :label="item.productId"
                    :value="item.productType"
                  />
                </span>
              </b-collapse>
            </div>
          </div>
        </template>
      </GridGFormItem>
</template> -->

<!-- <script lang="ts">

import { MBus } from '../../mixins/messagebus'

  wsBusMsg: any // mixin // store

  @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>

  demoResult: any = '--'
  radioOption: string = 'both' // (this.selectionClients?.length <= 0) ? 'both' : 'clients'
  isLoading: boolean = false
  actions: Array<string> = ['none', 'setup', 'uninstall', 'update', 'once', 'always', 'custom']
  conditn_InstStatus!: Array<string>
  conditn_InstStatus_defaults: Array<string|null> = [null, 'installed', 'unknown']
  conditn_ActionResult!: Array<string>
  conditn_ActionResult_default: Array<string> = ['failed', 'successful']
  quickaction: QuickAction = {
    action: null,
    outdated: false,
    installation_status: null,
    action_result: null,
    selectedClients: null,
    selectedDepots: null,
    // selectedDepots: undefined,
    demoMode: true
  }

  @Watch('selectionClients', { deep: true }) clientsChanged () {
    // this.radioOption = (this.selectionClients?.length <= 0) ? 'both' : 'clients'
    this.executeAction(true)
  }

  @Watch('radioOption', { deep: true }) _radioOptionChanged () {
    if (this.radioOption === 'both') {
      this.quickaction.selectedClients = undefined
      this.quickaction.selectedDepots = undefined
    } else if (this.radioOption === 'server') {
      this.quickaction.selectedDepots = this.selectionDepots
      this.quickaction.selectedClients = undefined
    } else if (this.radioOption === 'clients') {
      this.quickaction.selectedClients = [...this.selectionClients]
      this.quickaction.selectedDepots = undefined
    }
  }

  @Watch('quickaction', { deep: true }) async _quickactionChanged () {
    if (this.quickaction.action === this.$t('label.noselection')) { this.quickaction.action = null }
    if (this.quickaction.action_result === this.$t('label.noselection')) { this.quickaction.action_result = null }
    if (this.quickaction.installation_status === this.$t('label.noselection')) { this.quickaction.installation_status = null }
    await this.executeAction(true)
  }

  @Watch('wsBusMsg', { deep: true }) _wsBusMsgObjectChanged () {
    const msg = this.wsBusMsg // todo deepCopy
    if (msg &&
      ['event:productOnClient_created', 'event:productOnClient_updated'].includes(msg.channel)
      // && msg.data.productType === 'LocalbootProduct'
    ) {
      this.$fetch()
    }
  }

  _compareFn (a, b): number {
    if (a.productType > b.productType) { return -1 }
    if (a.productType < b.productType) { return 1 }
    if (a.productId > b.productId) { return 1 }
    if (a.productId < b.productId) { return -1 }
    return 0
  }

  sort (listofobj: Array<any>) {
    const poc = [...listofobj]
    poc.sort(this._compareFn)
    return poc
  }

  async fetch () {
    this.isLoading = true
    await this.fetchActionResults()
    await this.fetchInstallationStates()
    // this.radioOption = (this.selectionClients?.length <= 0) ? 'both' : 'clients'
    this.isLoading = false
  }

  async fetchActionResults () {
    await this.$axios.$get('/api/opsidata/products/action-result')
      .then((result) => {
        this.conditn_ActionResult = result
      }).catch((error) => {
        // const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        // const ref = (this.$refs.prodQuickActionAlert as any)
        // ref?.alert(this.$t('message.error.title'), 'danger', detailedError)
        this.showToastError(error.response.data)
        this.conditn_ActionResult = ['Successful', 'Failed']
      })
  }

  async fetchInstallationStates () {
    await this.$axios.$get('/api/opsidata/products/installation-status')
      .then((result) => {
        this.conditn_InstStatus = result
      }).catch((error) => {
        // const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        // const ref = (this.$refs.prodQuickActionAlert as any)
        // ref?.alert(this.$t('message.error.title'), 'danger', detailedError)
        this.showToastError(error.response.data)
        this.conditn_InstStatus = ['Installed', 'Unknown']
      })
  }

  async executeAction (demo = true) {
    const params = { ...this.quickaction, demoMode: demo }
    const ref = (this.$refs.prodQuickActionAlert as any)
    console.log(params)
    if (this.quickaction.outdated === false && this.quickaction.installation_status === null && this.quickaction.action_result === null) {
      ref?.alert(this.$t('message.error.condition'), 'danger')
      this.demoResult = undefined
      return
    } else if (this.quickaction.action === null && demo === false) {
      ref?.alert(this.$t('message.error.productquickaction'), 'danger')
    } else if (this.quickaction.action === null && demo === true) {
      params.action = 'none'
    } else {
      ref?.hide()
    }
    this.isLoading = true
    if (this.radioOption === 'clients') {
      params.selectedClients = this.selectionClients
    } else {
      params.selectedClients = null
    }
    await this.$axios.$post('/api/opsidata/clients/action', params)
      .then((result) => {
        this.demoResult = result || ''
        if (!demo) {
          this.showToastSuccess(this.$t('message.success.save.productactions'))
          this.executeAction(true) // do again to see new values as demo -> should be epty now
        }
        this.isLoading = false
      }).catch((error) => {
        this.demoResult = ''
        this.showToastError(error)
        this.isLoading = false
      })
  }

  resetForm () {
    this.quickaction = {
      action: null,
      outdated: false,
      installation_status: null,
      action_result: null
    } as QuickAction
  }
}
</script> -->
