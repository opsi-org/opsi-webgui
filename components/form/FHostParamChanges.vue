<template>
  <div>
    <InputIFilterTChanges v-if="changes" :filter.sync="filter" />
    <AlertAAlert ref="configViewAlert" />
    <span v-for="item in changes" :key="item.configId+item.value" :class="{ 'd-none': !item.configId.includes(filter) && !item.hostId.includes(filter) }">
      <GridGFormItem value-more="true">
        <template #label>
          <span :class="{'font-weight-bold': item.type=='depots'}"> {{ item.hostId }} </span>
        </template>
        <template #value>
          {{ $t('{') }} {{ item.configId }} {{ $t(':') }} {{ item.value }} {{ $t('}') }}
        </template>
        <template #valueMore>
          <ButtonBTNDeleteObj :item="item" from="hostparam" />
          <b-button class="border-0" variant="outline-primary" :title="$t('button.save')" @click="saveHostParam(item)">
            <span class="sr-only">{{ $t('button.save') }}</span>
            <b-icon :icon="iconnames.save" />
          </b-button>
        </template>
      </GridGFormItem>
    </span>
    <DivDComponentGroup class="float-right">
      <ButtonBTNClearChanges hide="trackChangesModal" from="hostparam" />
      <b-button variant="success" :title="$t('button.saveall')" @click="saveAllHostParam()">
        <b-icon :icon="iconnames.save" />
        <span class="saveall">{{ $t('button.saveall') }}</span>
      </b-button>
    </DivDComponentGroup>
    <!-- {{ changes }} -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, namespace, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
const changes = namespace('changes')

@Component({ mixins: [Constants] })
export default class FHostParamChanges extends Vue {
  @Prop({ }) changes!: any
  filter: string = ''
  $axios: any
  $t: any
  $nuxt: any
  @changes.Mutation public delFromChangesHostParam!: () => void

  async saveParameters (url: string, request: any, change:any) {
    const ref = (this.$refs.configViewAlert as any)
    await this.$axios.$post(url, request)
      .then(() => {
        // ref.alert(this.$t('message.success.updateConfig.save') as string + ' Config', 'success')
        // this.$nuxt.refresh()
        this.delFromChangesHostParam(change)
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.fetch') as string + ' Config', 'danger', detailedError)
      })
  }

  async saveHostParam (change: any) {
    let url: string = ''
    let request: any = []
    if (change.type === 'clients') {
      url = '/api/opsidata/config/clients'
      request = {
        clientIds: [change.hostId],
        configs: [{ configId: change.configId, value: change.value }]
      }
    } else {
      url = '/api/opsidata/config/server'
      request = [{ configId: change.configId, value: change.value }]
    }
    await this.saveParameters(url, request, change)
  }

  async saveAllHostParam () {
    for (const count in this.changes) {
      const item = this.changes[count]
      await this.saveHostParam(item)
    }
  }
}
</script>
