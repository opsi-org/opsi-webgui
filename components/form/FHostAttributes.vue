<template>
  <div data-testid="FHostAttributes">
    <AlertAAlert ref="hostAttrErrorAlert">
      <ButtonBTNRefetch :is-loading="isLoading" :refetch="$fetch" />
    </AlertAAlert>
    <GridGFormItem>
      <template #label>
        <span class="id">{{ $t('table.fields.id') }}</span>
      </template>
      <template #value>
        <b-form-input id="id" v-model="hostAttr.hostId" :aria-label="$t('table.fields.id')" readonly />
      </template>
    </GridGFormItem>
    <GridGFormItem>
      <template #label>
        <span class="type">{{ $t('table.fields.type') }}</span>
      </template>
      <template #value>
        <b-form-input id="type" :value="hostAttr.type" :aria-label="$t('table.fields.type')" readonly />
      </template>
    </GridGFormItem>
    <GridGFormItem>
      <template #label>
        <span class="description">{{ $t('table.fields.description') }}</span>
      </template>
      <template #value>
        <b-form-input id="description" v-model="hostAttr.description" :aria-label="$t('table.fields.description')" type="text" />
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
          rows="3"
          max-rows="3"
          no-resize
        />
      </template>
    </GridGFormItem>
    <GridGFormItem>
      <template #label>
        <span class="hwAddr">{{ $t('table.fields.hwAddr') }}</span>
      </template>
      <template #value>
        <b-form-input id="hwAddr" v-model="hostAttr.hardwareAddress" :aria-label="$t('table.fields.hwAddr')" type="text" />
      </template>
    </GridGFormItem>
    <GridGFormItem>
      <template #label>
        <span class="ip">{{ $t('table.fields.ip') }}</span>
      </template>
      <template #value>
        <b-form-input id="ip" v-model="hostAttr.ipAddress" :aria-label="$t('table.fields.ip')" />
      </template>
    </GridGFormItem>
    <GridGFormItem>
      <template #label>
        <span class="inventNum">{{ $t('table.fields.inventNum') }}</span>
      </template>
      <template #value>
        <b-form-input id="inventNum" v-model="hostAttr.inventoryNumber" :aria-label="$t('table.fields.inventNum')" type="text" />
      </template>
    </GridGFormItem>
    <GridGFormItem>
      <template #label>
        <span class="created">{{ $t('table.fields.created') }}</span>
      </template>
      <template #value>
        <b-form-input id="created" :value="date(hostAttr.created)" :aria-label="$t('table.fields.created')" readonly />
      </template>
    </GridGFormItem>
    <GridGFormItem>
      <template #label>
        <span class="lastSeen">{{ $t('table.fields.lastSeen') }}</span>
      </template>
      <template #value>
        <b-form-input id="lastSeen" :value="date(hostAttr.lastSeen)" :aria-label="$t('table.fields.lastSeen')" readonly />
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
            <b-icon v-if="showValue" :icon="iconnames.valueShow" />
            <b-icon v-else :icon="iconnames.valueHide" />
          </b-button>
          <b-form-input id="hostKey" v-model="hostAttr.opsiHostKey" :aria-label="$t('table.fields.hostKey')" :class="{'d-none' : !showValue}" type="text" />
        </b-input-group>
      </template>
    </GridGFormItem>
    <GridGFormItem>
      <template #label>
        <span class="otp">{{ $t('table.fields.otp') }}</span>
      </template>
      <template #value>
        <b-form-input id="otp" v-model="hostAttr.oneTimePassword" :aria-label="$t('table.fields.otp')" type="text" />
      </template>
    </GridGFormItem>
    <GridGFormItem v-if="hostAttr.type == 'OpsiClient'">
      <template #label>
        <span class="uefi">{{ $t('table.fields.uefi') }}</span>
      </template>
      <template #value>
        <b-form-checkbox id="uefi" v-model="hostAttr.uefi" :aria-label="$t('table.fields.uefi')" />
      </template>
    </GridGFormItem>
    <template v-if="hostAttr.type !== 'OpsiClient'">
      <GridGFormItem>
        <template #label>
          <span class="depotLocalUrl">{{ $t('table.fields.depotLocalUrl') }}</span>
        </template>
        <template #value>
          <b-form-input id="depotLocalUrl" v-model="hostAttr.depotLocalUrl" :aria-label="$t('table.fields.depotLocalUrl')" type="text" />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="depotWebdavUrl">{{ $t('table.fields.depotWebdavUrl') }}</span>
        </template>
        <template #value>
          <b-form-input id="depotWebdavUrl" v-model="hostAttr.depotWebdavUrl" :aria-label="$t('table.fields.depotWebdavUrl')" type="text" />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="repositoryLocalUrl">{{ $t('table.fields.repositoryLocalUrl') }}</span>
        </template>
        <template #value>
          <b-form-input id="repositoryLocalUrl" v-model="hostAttr.repositoryLocalUrl" :aria-label="$t('table.fields.repositoryLocalUrl')" type="text" />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="repositoryRemoteUrl">{{ $t('table.fields.repositoryRemoteUrl') }}</span>
        </template>
        <template #value>
          <b-form-input id="repositoryRemoteUrl" v-model="hostAttr.repositoryRemoteUrl" :aria-label="$t('table.fields.repositoryRemoteUrl')" type="text" />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="workbenchLocalUrl">{{ $t('table.fields.workbenchLocalUrl') }}</span>
        </template>
        <template #value>
          <b-form-input id="workbenchLocalUrl" v-model="hostAttr.workbenchLocalUrl" :aria-label="$t('table.fields.workbenchLocalUrl')" type="text" />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="workbenchRemoteUrl">{{ $t('table.fields.workbenchRemoteUrl') }}</span>
        </template>
        <template #value>
          <b-form-input id="workbenchRemoteUrl" v-model="hostAttr.workbenchRemoteUrl" :aria-label="$t('table.fields.workbenchRemoteUrl')" type="text" />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="networkAddress">{{ $t('table.fields.networkAddress') }}</span>
        </template>
        <template #value>
          <b-form-input id="networkAddress" v-model="hostAttr.networkAddress" :aria-label="$t('table.fields.networkAddress')" />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="maxBandwidth">{{ $t('table.fields.maxBandwidth') }}</span>
        </template>
        <template #value>
          <b-form-input id="maxBandwidth" v-model="hostAttr.maxBandwidth" :aria-label="$t('table.fields.maxBandwidth')" />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="isMasterDepot">{{ $t('table.fields.isMasterDepot') }}</span>
        </template>
        <template #value>
          <b-form-input id="isMasterDepot" v-model="hostAttr.isMasterDepot" :aria-label="$t('table.fields.isMasterDepot')" />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="masterDepotId">{{ $t('table.fields.masterDepotId') }}</span>
        </template>
        <template #value>
          <b-form-input id="masterDepotId" v-model="hostAttr.masterDepotId" :aria-label="$t('table.fields.masterDepotId')" type="text" />
        </template>
      </GridGFormItem>
    </template>
    <AlertAAlert ref="hostAttrUpdateAlert" />
    <LazyDivDComponentGroup v-if="hostAttr && hostAttr.type !== 'OpsiDepotserver'" class="float-right">
      <b-button id="resetButton" class="resetButton" variant="primary" @click="$fetch">
        <b-icon :icon="iconnames.reset" /> {{ $t('button.reset') }}
      </b-button>
      <b-button id="updateButton" class="updateButton" variant="success" @click="updateAttributes()">
        <b-icon :icon="iconnames.save" /> {{ $t('button.save') }}
      </b-button>
    </LazyDivDComponentGroup>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class FHostAttributes extends Vue {
  iconnames: any
  $axios: any
  $t: any
  $fetch: any

  @Prop({ }) id!: string
  @Prop({ }) type!: string
  showValue : boolean = false
  hostAttr:any = {}
  isLoading: boolean = false
  errorText: string = ''

  @Watch('id', { deep: true }) idChanged () { this.$fetch() }

  beforeMount () {
    this.$fetch()
  }

  async fetchAttributes (endPoint) {
    this.isLoading = true
    await this.$axios.$get(endPoint)
      .then((response) => {
        this.hostAttr = response[0]
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.hostAttrErrorAlert as any)
        ref.alert(this.$t('message.error.fetch') as string + 'Host Attributes', 'danger', detailedError)
        this.errorText = this.$t('message.error.defaulttext') as string
      })
    this.isLoading = false
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

  date (value:any) {
    if (value !== '') {
      return new Date(value).toString()
    } else { return value }
  }

  async setUEFI () {
    await this.$axios.$post(`api/opsidata/clients/${this.hostAttr.hostId}/uefi`)
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.hostAttrUpdateAlert as any)
        ref.alert(this.$t('message.error.uefi') as string, 'danger', detailedError)
      })
  }

  async updateClientAttributes () {
    this.isLoading = true
    const attr = this.hostAttr
    delete attr.type
    delete attr.created
    delete attr.lastSeen
    delete attr.uefi
    await this.$axios.$put(`/api/opsidata/clients/${this.hostAttr.hostId}`, attr)
      .then(() => {
        const ref = (this.$refs.hostAttrUpdateAlert as any)
        ref.alert(this.$t('message.success.updateHostAttr', { client: this.hostAttr.hostId }) as string, 'success')
        if (this.hostAttr.uefi) {
          this.setUEFI()
        }
        this.$fetch()
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.hostAttrUpdateAlert as any)
        ref.alert(this.$t('message.error.updateHostAttr') as string, 'danger', detailedError)
      })
    this.isLoading = false
  }

  async updateServerAttributes () {
    this.isLoading = true
    const attr = this.hostAttr
    delete attr.type
    delete attr.created
    delete attr.lastSeen
    await this.$axios.$put(`/api/opsidata/servers/${this.hostAttr.hostId}`, attr)
      .then(() => {
        const ref = (this.$refs.hostAttrUpdateAlert as any)
        ref.alert(this.$t('message.success.updateHostAttr', { client: this.hostAttr.hostId }) as string, 'success')
        this.$fetch()
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.hostAttrUpdateAlert as any)
        ref.alert(this.$t('message.error.updateHostAttr') as string, 'danger', detailedError)
      })
    this.isLoading = false
  }

  async updateAttributes () {
    if (this.hostAttr.type === 'OpsiClient') {
      await this.updateClientAttributes()
    } else {
      await this.updateServerAttributes()
    }
  }
}
</script>
