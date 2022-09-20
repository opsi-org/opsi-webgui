<template>
  <div data-testid="THostParam">
    <AlertAAlert ref="hostParamErrorAlert">
      <ButtonBTNRefetch :is-loading="isLoading" :refetch="$fetch" />
    </AlertAAlert>
    <InputIFilterTChanges :filter.sync="filter" />
    <span v-for="v,k in hostParam" :key="k">
      <b-button v-b-toggle="'collapse-'+k" class="text-left font-weight-bold" block variant="transparent">{{ k }}</b-button>
      <b-collapse :id="'collapse-'+k" :visible="filter === '' ? false : true">
        <LazyTableTDefault
          v-if="v"
          :noheader="true"
          :filter="filter"
          :fields="['configId', 'action']"
          :filterfields="['configId']"
          :items="v"
        >
          <template #cell()="row">
            {{ row.value }}
          </template>
          <template #cell(configId)="row">
            <span :id="'configId'+row.value">{{ row.value }}</span>
            <b-tooltip :target="'configId'+row.value">{{ row.item.description }}</b-tooltip>
          </template>
          <template #cell(action)="row">
            <!-- {{ row.item }} -->
            <CheckboxCBBoolParam v-if="row.item.type === 'BoolConfig'" :type="type" :row="row.item" />
            <SelectSUnicodeParam v-else :type="type" :row="row.item" />
            <!-- <template v-else>
              <template v-if="row.item.editable">
                <b-form-input v-model="newVal" :placeholder="$t('Type new value and press ENTER')" />
              </template>
              <b-form-select v-if="type === 'clients'" v-model="row.item.defaultValue" :multiple="row.item.multiValue" :options="row.item.possibleValues" />
              <b-form-select v-else v-model="row.item.value" :multiple="row.item.multiValue" :options="row.item.possibleValues" />
            </template> -->
          </template>
        </LazyTableTDefault>
      </b-collapse>
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class THostParam extends Vue {
  iconnames: any
  $axios: any
  $t: any
  $fetch: any

  @Prop({ }) id!: string
  @Prop({ }) type!: string
  filter: string = ''
  showValue : boolean = false
  hostParam:any = {}
  isLoading: boolean = false
  errorText: string = ''
  newVal: any

  @Watch('id', { deep: true }) idChanged () { this.$fetch() }

  beforeMount () {
    this.$fetch()
  }

  async fetchHostParameters (endpoint) {
    this.isLoading = true
    await this.$axios.$get(endpoint)
      .then((response) => {
        this.hostParam = response
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.hostParamErrorAlert as any)
        ref.alert(this.$t('message.error.fetch') as string + 'Host Parameters', 'danger', detailedError)
        this.errorText = this.$t('message.error.defaulttext') as string
      })
    this.isLoading = false
  }

  async fetch () {
    if (this.id) {
      let endpoint: any = ''
      if (this.type === 'clients') {
        endpoint = `/api/opsidata/config/clients?selectedClients=[${this.id}]`
      } else {
        endpoint = '/api/opsidata/config/server'
      }
      await this.fetchHostParameters(endpoint)
    }
  }
}
</script>
