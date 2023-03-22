<template>
  <div data-testid="GChangesHostParam">
    <InputIFilterTChanges v-if="changesHostParam.filter(o => o.user === username)" :placeholder="$t('table.filterBy.ConfigHost')" :filter.sync="filter" />
    <span v-for="item in changesHostParam.filter(o => o.user === username)" :key="item.configId+item.value" :class="{ 'd-none': !item.configId.includes(filter) && !item.hostId.includes(filter) }">
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
    <div class="float-right mt-2">
      <ButtonBTNClearChanges hide="trackChangesModal" from="hostparam" />
      <b-button variant="success" :title="$t('button.saveall')" @click="saveAllHostParam()">
        <b-icon :icon="iconnames.save" />
        <span class="saveall">{{ $t('button.saveall') }}</span>
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
import { SaveParameters } from '../../mixins/save'
const auth = namespace('auth')
const changes = namespace('changes')

@Component({ mixins: [Constants, SaveParameters] })
export default class GChangesHostParam extends Vue {
  filter: string = ''
  $axios: any
  $t: any
  $nuxt: any
  iconnames:any
  saveParameters:any
  @auth.Getter public username!: string
  @changes.Getter public changesHostParam!: Array<any>
  @changes.Mutation public delFromChangesHostParam!: (s: object) => void

  async saveHostParam (item: any) {
    let url: string = ''
    let request: any = []
    if (item.type === 'clients') {
      url = '/api/opsidata/config/clients'
      request = {
        clientIds: [item.hostId],
        configs: [{ configId: item.configId, value: item.value }]
      }
    } else {
      url = '/api/opsidata/config/server'
      request = [{ configId: item.configId, value: item.value }]
    }
    await this.saveParameters(url, request, item)
  }

  async saveAllHostParam () {
    const changelist = this.changesHostParam.filter(o => o.user === this.username)
    for (const count in changelist) {
      const item = changelist[count]
      await this.saveHostParam(item)
    }
  }
}
</script>
