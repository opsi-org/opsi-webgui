<template>
  <div>
    <AlertAAlert ref="hostAttrErrorAlert">
      <ButtonBTNRefetch :is-loading="isLoading" :refetch="$fetch" />
    </AlertAAlert>
    <TableTDefault
      data-testid="THostAttributes"
      :stacked="true"
      :is-loading="isLoading"
      :error="errorText"
      :items="Object.values(result)"
      :fields="fields"
    >
      <template #cell(opsiHostKey)="row">
        <b-input-group>
          <b-button :pressed.sync="showValue" size="sm" class="border-0" variant="outline-primary">
            <span class="sr-only">{{ showValue? $t('form.hostkey.hide'): $t('form.hostkey.show') }}</span>
            <b-icon v-if="showValue" :icon="iconnames.valueShow" />
            <b-icon v-else :icon="iconnames.valueHide" />
          </b-button>
          <b-form-input
            id="opsiHostKey"
            v-model="row.item.opsiHostKey"
            :aria-label="row.field.label"
            :class="{'d-none' : !showValue}"
            size="sm"
            readonly
          />
        </b-input-group>
      </template>
      <template #cell(notes)="row">
        <b-form-textarea
          id="notes"
          v-model="row.item.notes"
          :aria-label="row.field.label"
          class="forminput"
          size="sm"
          rows="2"
          max-rows="3"
          no-resize
          readonly
        />
      </template>
      <template #cell(created)="row">
        <b-form-input
          id="created"
          :value="date(row.value)"
          :aria-label="row.field.label"
          class="forminput"
          size="sm"
          readonly
        />
      </template>
      <template #cell(lastSeen)="row">
        <b-form-input
          id="lastSeen"
          :value="date(row.value)"
          :aria-label="row.field.label"
          class="forminput"
          size="sm"
          readonly
        />
      </template>
      <template #cell(uefi)="row">
        <b-form-checkbox
          id="uefi"
          v-model="row.value"
          :aria-label="row.field.label"
          disabled
        />
      </template>
    </TableTDefault>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class THostAttributes extends Vue {
  iconnames: any
  $axios: any
  $t: any
  $fetch: any

  @Prop({ }) id!: string
  showValue : boolean = false
  result:Object = {}
  isLoading: boolean = false
  errorText: string = ''

  get fields () {
    return [
      { label: this.$t('table.fields.id'), key: 'hostId', tdClass: 'hostId' },
      { label: this.$t('table.fields.type'), key: 'type', tdClass: 'type' },
      { label: this.$t('table.fields.description'), key: 'description', tdClass: 'description' },
      { label: this.$t('table.fields.notes'), key: 'notes', tdClass: 'notes' },
      { label: this.$t('table.fields.hwAddr'), key: 'hardwareAddress', tdClass: 'hwAddr' },
      { label: this.$t('table.fields.ip'), key: 'ipAddress', tdClass: 'ip' },
      { label: this.$t('table.fields.inventNum'), key: 'inventoryNumber', tdClass: 'inventNum' },
      { label: this.$t('table.fields.created'), key: 'created', tdClass: 'created' },
      { label: this.$t('table.fields.lastSeen'), key: 'lastSeen', tdClass: 'lastSeen' },
      { label: this.$t('table.fields.hostKey'), key: 'opsiHostKey', tdClass: 'hostKey' },
      { label: this.$t('table.fields.otp'), key: 'oneTimePassword', tdClass: 'otp' },
      { label: this.$t('table.fields.uefi'), key: 'uefi', tdClass: 'uefi' }
    ]
  }

  @Watch('id', { deep: true }) idChanged () { this.$fetch() }

  beforeMount () {
    this.$fetch()
  }

  async fetch () {
    if (this.id) {
      this.isLoading = true
      await this.$axios.$get(`/api/opsidata/hosts?hosts=${this.id}`)
        .then((response) => {
          this.result = response
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
}
</script>
