<template>
  <div data-testid="MProdActions">
    <b-button
      variant="outline-primary"
      size="sm"
      block
      @click="$bvModal.show('productactions')"
    >
      {{ $t(label) }}
    </b-button>
    <b-modal
      id="productactions"
      data-testid="MProdActionsModal"
      :title="$t('label.prodquickaction')"
      size="lg"
      centered
      scrollable
      hide-footer
    >
      <AlertAAlert ref="prodQuickActionAlert" />
      <OverlayOLoading :is-loading="isLoading" />
      <b-row class="text-small mb-2">
        <b>{{ $t('label.conditions') }} </b>
      </b-row>
      <GridGFormItem variant="longlabel" :label="$t('table.fields.instStatus')">
        <template #value>
          <b-form-select v-model="quickaction.installation_status" size="sm" :options="conditn_InstStatus">
            <template #first>
              <b-form-select-option :value="null">
                {{ t_fixed('keep-english.empty') }}
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
                {{ t_fixed('keep-english.empty') }}
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
                {{ t_fixed('keep-english.empty') }}
              </b-form-select-option>
            </template>
          </b-form-select>
        </template>
      </GridGFormItem>
      <GridGFormItem variant="longlabel">
        <template #value>
          <div class="float-right mt-4">
            <b-button id="resetButton" class="resetButton" variant="primary" size="sm" @click="resetForm()">
              {{ $t('button.reset') }}
            </b-button>
            <b-button variant="success" :disabled="quickaction.action == null" size="sm" @click="executeAction()">
              {{ $t('button.apply') }}
            </b-button>
          </div>
        </template>
      </GridGFormItem>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { MBus } from '../../mixins/messagebus'
import { Strings } from '../../mixins/strings'

interface QuickAction {
  action: any,
  outdated: boolean,
  installation_status: any,
  action_result: any
}

@Component({ mixins: [MBus, Strings] })
export default class MProductActions extends Vue {
  wsBusMsg: any // mixin // store
  t_fixed: any // mixin
  $t: any
  $fetch: any
  $axios: any

  @Prop({ default: 'label.quickaction' }) label?: string

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
    action_result: null
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

  async fetch () {
    this.isLoading = true
    await this.fetchActionResults()
    await this.fetchInstallationStates()
    this.isLoading = false
  }

  async fetchActionResults () {
    await this.$axios.$get('/api/opsidata/products/action-result')
      .then((result) => {
        this.conditn_ActionResult = result
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        const ref = (this.$refs.prodQuickActionAlert as any)
        ref?.alert(this.$t('message.error.title'), 'danger', detailedError)
        this.conditn_ActionResult = ['Successful', 'Failed']
      })
  }

  async fetchInstallationStates () {
    await this.$axios.$get('/api/opsidata/products/installation-status')
      .then((result) => {
        this.conditn_InstStatus = result
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        const ref = (this.$refs.prodQuickActionAlert as any)
        ref?.alert(this.$t('message.error.title'), 'danger', detailedError)
        this.conditn_InstStatus = ['Installed', 'Unknown']
      })
  }

  async executeAction () {
    const ref = (this.$refs.prodQuickActionAlert as any)
    if (this.quickaction.outdated === false && this.quickaction.installation_status === null && this.quickaction.action_result === null) {
      ref.alert(this.$t('Choose any condition.'), 'danger')
    } else {
      this.isLoading = true
      await this.$axios.$post('/api/opsidata/clients/action', this.quickaction)
        .then(() => {
          ref.alert(this.$t('message.success.title'), 'success')
        }).catch((error) => {
          const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
          ref.alert(this.$t('message.error.title'), 'danger', detailedError)
        })
      this.isLoading = false
    }
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
</script>
