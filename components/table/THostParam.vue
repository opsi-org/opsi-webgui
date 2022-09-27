<template>
  <div data-testid="THostParam">
    <AlertAAlert ref="hostParamErrorAlert">
      <ButtonBTNRefetch :is-loading="isLoading" :refetch="$fetch" />
    </AlertAAlert>
    <InputIFilterTChanges :filter.sync="filter" />
    <DivDScrollResult>
      <span v-for="v,k in hostParam" :key="k">
        <b-button v-b-toggle="'collapse-'+k" class="text-left font-weight-bold border-0" block variant="outline-primary">{{ k }}</b-button>
        <b-collapse :id="'collapse-'+k" :visible="filter === '' ? false : true">
          <!-- <span v-for="item in v" :key="item.configId">
            <GridGFormItem>
              <template #label>
                {{ item.configId }}
              </template>
              <template #value>
                <CheckboxCBBoolParam v-if="item.type === 'BoolConfig'" :type="type" :row="item" />
                <TreeTSUnicodeParam v-else :type="type" :row="item" />
              </template>
            </GridGFormItem>
          </span> -->
          <LazyTableTDefault
            v-if="v"
            :noheader="true"
            :fixed="true"
            :filter="filter"
            :fields="['configId', 'action']"
            :filterfields="['configId']"
            :items="v"
            type="productproperties"
          >
            <template #cell()="row">
              {{ row.value }}
            </template>
            <template #cell(configId)="row">
              <p :id="'configId'+row.value" class="text-sm-right text-break">{{ row.value }}</p>
              <b-tooltip :target="'configId'+row.value">{{ row.item.description }}</b-tooltip>
            </template>
            <template #cell(action)="row">
              <TableCellTCUnicodeParam :configtype="row.item.type" :type="type" :row="row.item" />
              <!-- <CheckboxCBBoolParam v-if="row.item.type === 'BoolConfig'" :type="type" :row="row.item" />
              <TreeTSUnicodeParam v-else :type="type" :row="row.item" /> -->
            </template>
          </LazyTableTDefault>
        </b-collapse>
      </span>
    </DivDScrollResult>
    <DivDComponentGroup class="float-right">
      <b-button id="addButton" class="addButton" variant="success" @click="saveHostParam()">
        <b-icon :icon="iconnames.save" /> {{ $t('button.save') }}
      </b-button>
    </DivDComponentGroup>
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
<style>
.noheader{
  display: none;
}
</style>
