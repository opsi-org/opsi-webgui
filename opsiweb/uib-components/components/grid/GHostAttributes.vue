<template>
  <div data-testid="GHostAttributes">
    <OverlayOLoading :is-loading="(isLoading || $fetchState.pending)" />
    <AlertAAlert ref="hostAttrErrorAlert" />
    <DivDScrollResult>
      <div v-for="(value, label, index) in hostAttr" :key="index">
        <GridGFormItem :label="label" :labelclass="label + ' ' + (label.toString() === 'uefi' ? 'text-uppercase' : 'text-capitalize')" variant="longvalue">
          <template #value>
            <b-form-input
              v-if="label.toString() === 'created' || label.toString() === 'lastSeen'"
              :value="date(value)"
              :class="label"
              size="sm"
              readonly
            />
            <b-input-group v-else-if="label.toString() === 'opsiHostKey'">
              <b-button :pressed.sync="showValue" size="sm" class="border-0" variant="outline-primary">
                <span class="sr-only">{{ showValue? $t('form.hostkey.hide'): $t('form.hostkey.show') }}</span>
                <b-icon :icon="showValue ? icon.valueShow : icon.valueHide" />
              </b-button>
              <b-form-input id="hostKey" v-model="hostAttr[label.toString()]" size="sm" :class="{'d-none' : !showValue, [label]: true}" />
            </b-input-group>
            <b-form-checkbox v-else-if="typeof value == 'boolean'" v-model="hostAttr[label.toString()]" size="sm" />
            <b-form-input
              v-else
              v-model="hostAttr[label.toString()]"
              size="sm"
              :class="label"
              :readonly="readOnlyFields.includes(label.toString())"
            />
          </template>
        </GridGFormItem>
      </div>
    </DivDScrollResult>
    <GridGFormItem v-if="hostAttr.type !== 'OpsiDepotserver'" variant="longvalue">
      <template #value>
        <div class="float-right">
          <b-button id="resetButton" class="resetButton" variant="primary" size="sm" @click="$fetch">
            <b-icon :icon="icon.reset" />
            <span class="resetButton">{{ $t('button.reset') }}</span>
          </b-button>
          <b-button
            id="updateButton"
            :disabled="config?.read_only"
            class="updateButton"
            variant="success"
            size="sm"
            @click="updateAttributes()"
          >
            <b-icon :icon="icon.check" />
            <span class="updateButton">{{ $t('button.save') }}</span>
          </b-button>
        </div>
      </template>
    </GridGFormItem>
    <DivDScrollResult v-else>
      {{ t_fixed('keep-english.empty') }}
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Watch, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
import { SetUEFI } from '../../mixins/post'
import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
import { Strings } from '../../mixins/strings'
import { AlertToast } from '../../mixins/component'
const config = namespace('config-app')

@Component({ mixins: [Icons, Strings, SetUEFI, AlertToast] })
export default class GHostAttributes extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) type!: string
  showToastSuccess: any // mixin
  showToastError: any // mixin
  showValue : boolean = false
  hostAttr:any = {}
  isLoading: boolean = false
  errorText: string = ''
  setUEFI: any
  icon: any
  $axios: any
  $t: any
  t_fixed: any
  $fetch: any
  readOnlyFields: Array<string> = ['hostId', 'type', 'systemUUID', 'created', 'lastSeen']

  @config.Getter public config!: IObjectString2Boolean

  @Watch('id', { deep: true }) idChanged () { this.$fetch() }

  async fetch () { await this._fetch() }

  async _fetch () {
    if (this.id) {
      let endPoint: any = ''
      if (this.type === 'clients') {
        endPoint = `/api/opsidata/hosts?hosts=${this.id}`
      } else {
        endPoint = `/api/opsidata/servers?servers=[${this.id}]`
      }
      await this.fetchAttributes(endPoint)
    }
  }

  async fetchAttributes (endPoint) {
    await this.$axios.$get(endPoint)
      .then((response) => {
        this.hostAttr = response[0]
      }).catch((error) => {
        this.showToastError(error, this.$t('message.error.defaulttext'))
        // const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        // const ref = (this.$refs.hostAttrErrorAlert as any)
        // ref.alert(detailedError, 'danger')
        // this.errorText = this.$t('message.error.defaulttext') as string
      })
  }

  date (value:any) {
    if (value !== '' || value !== undefined) {
      return new Date(value).toString()
    } else { return '' }
  }

  async update (attr, endPoint) {
    this.isLoading = true
    await this.$axios.$put(endPoint, attr)
      .then((response) => {
        this.showToastSuccess(this.$t('message.success.save.hostattributes', { host: attr.hostId }))
        this.$fetch()
      }).catch(async (error) => {
        this.showToastError(error)
        await this._fetch()
      })
    this.isLoading = false
  }

  async updateAttributes () {
    let endPoint: any = ''
    const attr = this.hostAttr
    delete attr.type
    delete attr.created
    delete attr.lastSeen
    delete attr.systemUUID
    if (this.type === 'clients') {
      this.setUEFI(this.hostAttr.hostId, attr.uefi.toString())
      delete attr.uefi
      endPoint = `/api/opsidata/clients/${this.hostAttr.hostId}`
    } else {
      endPoint = `/api/opsidata/servers/${this.hostAttr.hostId}`
    }
    await this.update(attr, endPoint)
  }
}
</script>
