<template>
  <TableTBVTable
    data-testid="THostAttributes"
    :stacked="true"
    :is-loading="isLoading"
    :error="errorText"
    :items="[result]"
    :fields="fields"
  >
    <template #cell(opsiHostKey)="row">
      <b-input-group>
        <b-button :pressed.sync="showValue" size="sm" variant="outline-primary">
          <b-icon v-if="showValue" icon="eye-slash" />
          <b-icon v-else icon="eye" />
        </b-button>
        <b-form-input v-model="row.item.opsiHostKey" :class="{'d-none' : !showValue}" size="sm" readonly />
      </b-input-group>
    </template>
    <template #cell(notes)="row">
      <b-form-textarea
        v-model="row.item.notes"
        size="sm"
        rows="2"
        max-rows="3"
        no-resize
        readonly
      />
    </template>
    <template #cell(created)="row">
      <b-form-input :value="new Date(row.value)" size="sm" readonly />
    </template>
    <template #cell(lastSeen)="row">
      <b-form-input :value="new Date(row.value)" size="sm" readonly />
    </template>
  </TableTBVTable>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'nuxt-property-decorator'

@Component
export default class THostAttributes extends Vue {
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
      await this.$axios.$get(`/api/opsidata/hosts?hosts=${this.id}`)
        .then((response) => {
          this.result = response[0]
        }).catch((error) => {
        // eslint-disable-next-line no-console
          console.error(error)
          this.errorText = this.$t('message.errortext') as string
        })
      this.isLoading = false
    }
  }
}
</script>
