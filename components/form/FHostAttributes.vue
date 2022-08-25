<template>
  <div data-testid="FHostAttributes">
    <AlertAAlert ref="hostAttrErrorAlert">
      <ButtonBTNRefetch :is-loading="isLoading" :refetch="$fetch" />
    </AlertAAlert>
    <AlertAAlert ref="hostAttrUpdateAlert" />
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
    <LazyDivDComponentGroup v-if="hostAttr" class="float-right">
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
  showValue : boolean = false
  hostAttr:any = {}
  isLoading: boolean = false
  errorText: string = ''

  @Watch('id', { deep: true }) idChanged () { this.$fetch() }

  beforeMount () {
    this.$fetch()
  }

  async fetch () {
    if (this.id) {
      this.isLoading = true
      await this.$axios.$get(`/api/opsidata/hosts?hosts=${this.id}`)
        .then((response) => {
          this.hostAttr = response[0]
        }).catch((error) => {
          const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
          const ref = (this.$refs.hostAttrErrorAlert as any)
          ref.alert(this.$t('message.error.fetch') as string + 'Hosts', 'danger', detailedError)
          this.errorText = this.$t('message.error.defaulttext') as string
        })
      this.isLoading = false
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

  updateServerAttributes () {
    return ''
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
