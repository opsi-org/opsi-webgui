<template>
  <div data-testid="THostParam">
    <InputIFilterTChanges :filter.sync="filterLocal" />
    <!-- <template v-if="id">
      <span v-for="v,k in hostparams" :key="k">
        <b-button class="text-left font-weight-bold" block v-b-toggle="'collapse-'+k" variant="transparent">{{k}}</b-button>
        <b-collapse :id="'collapse-'+k" accordion="hostparam">
          <b-table-lite :fields="['configId', 'description', 'value']" :items="v"></b-table-lite>
        </b-collapse>
      </span>
    </template> -->
    <span v-for="v,k in hostparams" :key="k">
      <b-button class="text-left font-weight-bold" block v-b-toggle="'collapse-'+k" variant="transparent">{{k}}</b-button>
      <b-collapse :id="'collapse-'+k" accordion="hostparam">
        <!-- <b-card>
          <p class="card-text">{{v}}</p>
          <b-table-lite :fields="['configId', 'description', 'value']" :items="v"></b-table-lite>
        </b-card> -->
        <TableTDefault
          type="small"
          :noheader="true"
          :filter="filterLocal"
          :filterfields="['configId']"
          :items="v"
          :fields="['configId', 'description', 'value']"
        >
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
  showValue : boolean = false
  hostParam:any = {}
  isLoading: boolean = false
  errorText: string = ''

  @Watch('id', { deep: true }) idChanged () { this.$fetch() }

  beforeMount () {
    this.$fetch()
  }

  async fetchClientParameters () {
    if (this.id) {
      this.isLoading = true
      await this.$axios.$get(`/api/opsidata/hosts?hosts=${this.id}`)
        .then((response) => {
          this.hostParam = response[0]
        }).catch((error) => {
          const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
          const ref = (this.$refs.hostAttrErrorAlert as any)
          ref.alert(this.$t('message.error.fetch') as string + 'Host Attributes', 'danger', detailedError)
          this.errorText = this.$t('message.error.defaulttext') as string
        })
      this.isLoading = false
    }
  }

  async fetchServerParameters () {
    if (this.id) {
      this.isLoading = true
      await this.$axios.$get(`/api/opsidata/servers?servers=[${this.id}]`)
        .then((response) => {
          this.hostParam = response[0]
        }).catch((error) => {
          const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
          const ref = (this.$refs.hostAttrErrorAlert as any)
          ref.alert(this.$t('message.error.fetch') as string + 'Host Attributes', 'danger', detailedError)
          this.errorText = this.$t('message.error.defaulttext') as string
        })
      this.isLoading = false
    }
  }

  async fetch () {
    if (this.type === 'clients') {
      await this.fetchClientParameters()
    } else {
      await this.fetchServerParameters()
    }
  }
}
</script>
