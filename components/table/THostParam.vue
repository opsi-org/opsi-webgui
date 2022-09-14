<template>
  <div data-testid="THostParam">
    <AlertAAlert ref="hostParamErrorAlert">
      <ButtonBTNRefetch :is-loading="isLoading" :refetch="$fetch" />
    </AlertAAlert>
    <InputIFilterTChanges :filter.sync="filter" />
    <span v-for="v,k in hostParam" :key="k">
      <b-button v-b-toggle="'collapse-'+k" class="text-left font-weight-bold" block variant="transparent">{{ k }}</b-button>
      <b-collapse :id="'collapse-'+k" :visible="filter === '' ? false : true">
        <TableTDefault
          type="small"
          :filter="filter"
          :filterfields="['configId']"
          :fields="['configId', 'description', 'value']"
          :items="v"
        >
          <!-- :noheader="true" -->
          <!-- :fields="['configId', 'description', 'value']" -->
          <template #cell()="row">
            {{ row.value }}
          </template>
        </TableTDefault>
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
