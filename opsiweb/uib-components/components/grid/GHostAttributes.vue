<template>
  <div data-testid="GHostAttributes">
    <OverlayOLoading :is-loading="(isLoading || $fetchState.pending)" />
    <AlertAAlert ref="hostAttrErrorAlert" />
    <LazyDivDScrollResult v-if="hostAttr" :key="hostAttr.hostId">
      <div v-for="(value, label, index) in hostAttr" :key="index">
        <GridGFormItem :label="label" :labelclass="label.toString() === 'uefi' ? 'text-uppercase' : 'text-capitalize'">
          <template #value>
            <b-form-input v-if="label.toString() === 'created' || label.toString() === 'lastSeen'" :value="date(value)" size="sm" readonly />
            <b-input-group v-else-if="label.toString() === 'opsiHostKey'">
              <b-button :pressed.sync="showValue" size="sm" class="border-0" variant="outline-primary">
                <span class="sr-only">{{ showValue? $t('form.hostkey.hide'): $t('form.hostkey.show') }}</span>
                <b-icon :icon="showValue ? icon.valueShow : icon.valueHide" />
              </b-button>
              <b-form-input id="hostKey" v-model="hostAttr[label.toString()]" size="sm" :class="{'d-none' : !showValue}" />
            </b-input-group>
            <b-form-checkbox v-else-if="typeof value == 'boolean'" v-model="hostAttr[label.toString()]" size="sm" />
            <b-form-input v-else v-model="hostAttr[label.toString()]" size="sm" :readonly="readonly(label.toString())" />
          </template>
        </GridGFormItem>
      </div>
    </LazyDivDScrollResult>
    <GridGFormItem v-if="hostAttr.type !== 'OpsiDepotserver' && (config && config.read_only == false)">
      <template #value>
        <div class="float-right">
          <b-button id="resetButton" class="resetButton" variant="primary" size="sm" @click="$fetch">
            <b-icon :icon="icon.reset" /> {{ $t('button.reset') }}
          </b-button>
          <b-button id="updateButton" class="updateButton" variant="success" size="sm" @click="updateAttributes()">
            <b-icon :icon="icon.check" /> {{ $t('button.save') }}
          </b-button>
        </div>
      </template>
    </GridGFormItem>
    <DivDScrollResult v-else>
      {{ $t('empty') }}
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Watch, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
import { SetUEFI } from '../../mixins/post'
import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
const config = namespace('config-app')
@Component({ mixins: [Icons, SetUEFI] })
export default class GHostAttributes extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) type!: string
  showValue : boolean = false
  hostAttr:any = {}
  isLoading: boolean = false
  errorText: string = ''
  setUEFI: any
  icon: any
  $axios: any
  $t: any
  $fetch: any

  @config.Getter public config!: IObjectString2Boolean

  @Watch('id', { deep: true }) idChanged () { this.$fetch() }

  readonly (label: string) {
    switch (label) {
      case 'hostId': return true
      case 'type': return true
      case 'systemUUID': return true
      case 'created': return true
      case 'lastSeen': return true
      default: return false
    }
  }

  async fetch () {
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
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        const ref = (this.$refs.hostAttrErrorAlert as any)
        ref.alert(this.$t('message.error.fetch') + this.$t('title.hostattr') + '.', 'danger', detailedError)
        this.errorText = this.$t('message.error.defaulttext') as string
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
      .then(() => {
        const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
        ref.alert(this.$t('message.success.updateHostAttr', { client: this.hostAttr.hostId }) as string, 'success')
        this.$fetch()
      }).catch((error) => {
        const ref = (this.$root.$children[1].$refs.errorAlert as any) || (this.$root.$children[2].$refs.errorAlert as any)
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        ref.alert(this.$t('message.error.updateHostAttr') as string, 'danger', detailedError)
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
      this.setUEFI(this.hostAttr.hostId)
      delete attr.uefi
      endPoint = `/api/opsidata/clients/${this.hostAttr.hostId}`
    } else {
      endPoint = `/api/opsidata/servers/${this.hostAttr.hostId}`
    }
    await this.update(attr, endPoint)
  }
}
</script>