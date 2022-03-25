<template>
  <div>
    <AlertAAlert ref="hostAttrAlert" />
    <TableTBVTable
      data-testid="THostAttributes"
      :stacked="true"
      :is-loading="isLoading"
      :error="errorText"
      :items="result"
      :fields="fields"
    >
      <template #cell(opsiHostKey)="row">
        <b-input-group>
          <b-button :pressed.sync="showValue" size="sm" variant="transparent">
            <span class="sr-only">{{ showValue? 'Hide opsiHostKey': 'Show opsiHostKey' }}</span>
            <b-icon v-if="showValue" :icon="iconnames.valueShow" />
            <b-icon v-else :icon="iconnames.valueHide" />
          </b-button>
          <label for="opsiHostKey" class="sr-only">  {{ row.field.label }} </label>
          <b-form-input id="opsiHostKey" v-model="row.item.opsiHostKey" :class="{'d-none' : !showValue}" size="sm" readonly />
        </b-input-group>
      </template>
      <template #cell(notes)="row">
        <label for="notes" class="sr-only">  {{ row.field.label }} </label>
        <b-form-textarea
          id="notes"
          v-model="row.item.notes"
          :aria-label="row.item.notes"
          class="forminput"
          size="sm"
          rows="2"
          max-rows="3"
          no-resize
          readonly
        />
      </template>
      <template #cell(created)="row">
        <label for="created" class="sr-only">  {{ row.field.label }} </label>
        <b-form-input
          id="created"
          :value="date(row.value)"
          :aria-label="date(row.value)"
          class="forminput"
          size="sm"
          readonly
        />
      </template>
      <template #cell(lastSeen)="row">
        <label for="lastSeen" class="sr-only">  {{ row.field.label }} </label>
        <b-form-input
          id="lastSeen"
          :value="date(row.value)"
          :aria-label="date(row.value)"
          class="forminput"
          size="sm"
          readonly
        />
      </template>
    </TableTBVTable>
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
      { label: this.$t('table.fields.id'), key: 'hostId' },
      { label: this.$t('table.fields.type'), key: 'type' },
      { label: this.$t('table.fields.description'), key: 'description' },
      { label: this.$t('table.fields.notes'), key: 'notes' },
      { label: this.$t('table.fields.hwAddr'), key: 'hardwareAddress' },
      { label: this.$t('table.fields.ip'), key: 'ipAddress' },
      { label: this.$t('table.fields.inventNum'), key: 'inventoryNumber' },
      { label: this.$t('table.fields.created'), key: 'created' },
      { label: this.$t('table.fields.lastSeen'), key: 'lastSeen' },
      { label: this.$t('table.fields.hostKey'), key: 'opsiHostKey' },
      { label: this.$t('table.fields.otp'), key: 'oneTimePassword' }
    ]
  }

  @Watch('id', { deep: true }) idChanged () { this.$fetch() }

  beforeMount () {
    this.$fetch()
  }

  async fetch () {
    if (this.id) {
      this.isLoading = true
      await this.$axios.$get(`/api/opsidata/host?hosts=${this.id}`)
        .then((response) => {
          this.result = response
        }).catch((error) => {
          const ref = (this.$refs.hostAttrAlert as any)
          ref.alert('Failed to fetch: Hosts', 'danger', error)
          this.errorText = this.$t('message.errortext') as string
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
