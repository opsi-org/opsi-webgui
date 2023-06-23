<template>
  <div data-testid="FHostAttributes" class="FHostAttributes">
    <OverlayOLoading :is-loading="(isLoading || $fetchState.pending)" />
    <AlertAAlert ref="hostAttrErrorAlert" />
    <LazyDivDScrollResult v-if="hostAttr" :key="hostAttr.hostId">
      <GridGFormItem>
        <template #label>
          <span class="id">{{ $t('table.fields.id') }}</span>
        </template>
        <template #value>
          <b-form-input id="id" v-model="hostAttr.hostId" size="sm" :aria-label="$t('table.fields.id')" readonly />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="type">{{ $t('table.fields.type') }}</span>
        </template>
        <template #value>
          <b-form-input id="type" :value="hostAttr.type" size="sm" :aria-label="$t('table.fields.type')" readonly />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="description">{{ $t('table.fields.description') }}</span>
        </template>
        <template #value>
          <b-form-input id="description" v-model="hostAttr.description" size="sm" :aria-label="$t('table.fields.description')" type="text" />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="notes">{{ $t('table.fields.notes') }}</span>
        </template>
        <template #value>
          <b-form-textarea
            id="notes"
            v-model="hostAttr.notes"
            :aria-label="$t('table.fields.notes')"
            rows="1"
            max-rows="3"
            size="sm"
            no-resize
          />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="hwAddr">{{ $t('table.fields.hwAddr') }}</span>
        </template>
        <template #value>
          <b-form-input id="hwAddr" v-model="hostAttr.hardwareAddress" size="sm" :aria-label="$t('table.fields.hwAddr')" type="text" />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="ip">{{ $t('table.fields.ip') }}</span>
        </template>
        <template #value>
          <b-form-input id="ip" v-model="hostAttr.ipAddress" size="sm" :aria-label="$t('table.fields.ip')" />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="inventNum">{{ $t('table.fields.inventNum') }}</span>
        </template>
        <template #value>
          <b-form-input id="inventNum" v-model="hostAttr.inventoryNumber" size="sm" :aria-label="$t('table.fields.inventNum')" type="text" />
        </template>
      </GridGFormItem>
      <GridGFormItem v-if="hostAttr.created">
        <template #label>
          <span class="created">{{ $t('table.fields.created') }}</span>
        </template>
        <template #value>
          <b-form-input id="created" :value="date(hostAttr.created)" size="sm" :aria-label="$t('table.fields.created')" readonly />
        </template>
      </GridGFormItem>
      <GridGFormItem v-if="hostAttr.lastSeen">
        <template #label>
          <span class="lastSeen">{{ $t('table.fields.lastSeen') }}</span>
        </template>
        <template #value>
          <b-form-input id="lastSeen" :value="date(hostAttr.lastSeen)" size="sm" :aria-label="$t('table.fields.lastSeen')" readonly />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="hostKey">{{ $t('table.fields.hostKey') }}</span>
        </template>
        <template #value>
          <b-input-group>
            <b-button :pressed.sync="showValue" size="sm" class="border-0" variant="outline-primary">
              <span class="sr-only">{{ showValue? $t('form.hostkey.hide'): $t('form.hostkey.show') }}</span>
              <b-icon v-if="showValue" :icon="icon.valueShow" />
              <b-icon v-else :icon="icon.valueHide" />
            </b-button>
            <b-form-input id="hostKey" v-model="hostAttr.opsiHostKey" size="sm" :aria-label="$t('table.fields.hostKey')" :class="{'d-none' : !showValue}" />
          </b-input-group>
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="otp">{{ $t('table.fields.otp') }}</span>
        </template>
        <template #value>
          <b-form-input id="otp" v-model="hostAttr.oneTimePassword" size="sm" :aria-label="$t('table.fields.otp')" type="text" />
        </template>
      </GridGFormItem>
      <GridGFormItem v-if="type == 'clients'">
        <template #label>
          <span class="uefi">{{ $t('table.fields.uefi') }}</span>
        </template>
        <template #value>
          <b-form-checkbox id="uefi" v-model="hostAttr.uefi" size="sm" :aria-label="$t('table.fields.uefi')" />
        </template>
      </GridGFormItem>
      <GridGFormItem v-if="hostAttr.systemUUID">
        <template #label>
          <span class="smbiosuuid">{{ $t('table.fields.smbiosuuid') }}</span>
        </template>
        <template #value>
          <b-form-input
            id="smbiosuuid"
            v-model="hostAttr.systemUUID"
            size="sm"
            :aria-label="$t('table.fields.smbiosuuid')"
            type="text"
            readonly
          />
        </template>
      </GridGFormItem>
      <template v-if="type !== 'clients'">
        <GridGFormItem>
          <template #label>
            <span class="depotLocalUrl">{{ $t('table.fields.depotLocalUrl') }}</span>
          </template>
          <template #value>
            <b-form-input id="depotLocalUrl" v-model="hostAttr.depotLocalUrl" size="sm" :aria-label="$t('table.fields.depotLocalUrl')" type="text" />
          </template>
        </GridGFormItem>
        <GridGFormItem>
          <template #label>
            <span class="depotWebdavUrl">{{ $t('table.fields.depotWebdavUrl') }}</span>
          </template>
          <template #value>
            <b-form-input id="depotWebdavUrl" v-model="hostAttr.depotWebdavUrl" size="sm" :aria-label="$t('table.fields.depotWebdavUrl')" type="text" />
          </template>
        </GridGFormItem>
        <GridGFormItem>
          <template #label>
            <span class="repositoryLocalUrl">{{ $t('table.fields.repositoryLocalUrl') }}</span>
          </template>
          <template #value>
            <b-form-input id="repositoryLocalUrl" v-model="hostAttr.repositoryLocalUrl" size="sm" :aria-label="$t('table.fields.repositoryLocalUrl')" type="text" />
          </template>
        </GridGFormItem>
        <GridGFormItem>
          <template #label>
            <span class="repositoryRemoteUrl">{{ $t('table.fields.repositoryRemoteUrl') }}</span>
          </template>
          <template #value>
            <b-form-input id="repositoryRemoteUrl" v-model="hostAttr.repositoryRemoteUrl" size="sm" :aria-label="$t('table.fields.repositoryRemoteUrl')" type="text" />
          </template>
        </GridGFormItem>
        <GridGFormItem>
          <template #label>
            <span class="workbenchLocalUrl">{{ $t('table.fields.workbenchLocalUrl') }}</span>
          </template>
          <template #value>
            <b-form-input id="workbenchLocalUrl" v-model="hostAttr.workbenchLocalUrl" size="sm" :aria-label="$t('table.fields.workbenchLocalUrl')" type="text" />
          </template>
        </GridGFormItem>
        <GridGFormItem>
          <template #label>
            <span class="workbenchRemoteUrl">{{ $t('table.fields.workbenchRemoteUrl') }}</span>
          </template>
          <template #value>
            <b-form-input id="workbenchRemoteUrl" v-model="hostAttr.workbenchRemoteUrl" size="sm" :aria-label="$t('table.fields.workbenchRemoteUrl')" type="text" />
          </template>
        </GridGFormItem>
        <GridGFormItem>
          <template #label>
            <span class="networkAddress">{{ $t('table.fields.networkAddress') }}</span>
          </template>
          <template #value>
            <b-form-input id="networkAddress" v-model="hostAttr.networkAddress" size="sm" :aria-label="$t('table.fields.networkAddress')" />
          </template>
        </GridGFormItem>
        <GridGFormItem>
          <template #label>
            <span class="maxBandwidth">{{ $t('table.fields.maxBandwidth') }}</span>
          </template>
          <template #value>
            <b-form-input id="maxBandwidth" v-model="hostAttr.maxBandwidth" size="sm" :aria-label="$t('table.fields.maxBandwidth')" />
          </template>
        </GridGFormItem>
        <GridGFormItem>
          <template #label>
            <span class="isMasterDepot">{{ $t('table.fields.isMasterDepot') }}</span>
          </template>
          <template #value>
            <b-form-checkbox id="isMasterDepot" v-model="hostAttr.isMasterDepot" size="sm" :aria-label="$t('table.fields.isMasterDepot')" />
          </template>
        </GridGFormItem>
        <GridGFormItem>
          <template #label>
            <span class="masterDepotId">{{ $t('table.fields.masterDepotId') }}</span>
          </template>
          <template #value>
            <b-form-input id="masterDepotId" v-model="hostAttr.masterDepotId" size="sm" :aria-label="$t('table.fields.masterDepotId')" type="text" />
          </template>
        </GridGFormItem>
      </template>
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
export default class FHostAttributes extends Vue {
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
