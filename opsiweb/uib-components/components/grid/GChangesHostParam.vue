<template>
  <div data-testid="GChangesHostParam">
    <AlertAAlert ref="changesHostParamAlert" />
    <b-row>
      <b-col>
        <InputIFilterTChanges v-if="changesHostParam.filter(o => o.user === username)" :placeholder="$t('table.filterBy.ConfigHost')" :filter.sync="filter" />
      </b-col>
      <b-col cols="auto">
        <ButtonBTNClearChanges hide="trackChangesModal" from="hostparam" />
        <b-button variant="success" size="sm" :title="$t('button.saveall')" @click="saveAllHostParam()">
          <b-icon :icon="icon.check" />
          <span class="saveall">{{ $t('button.saveall') }}</span>
        </b-button>
      </b-col>
    </b-row>
    <DivDScrollResult>
      <span v-for="item in changesHostParam.filter(o => o.user === username)" :key="item.configId+item.value" :class="{ 'd-none': !item.configId.includes(filter) && !item.hostId.includes(filter) }">
        <GridGFormItem
          value-more="true"
          :label="item.hostId"
          :labelclass="{'font-weight-bold': item.type=='depots'}"
          :value="'{ '+ item.configId + ' : ' + item.value + ' }'"
        >
          <template #valueMore>
            <ButtonBTNDeleteObj :item="item" from="hostparam" />
            <b-button class="border-0" variant="outline-primary" size="sm" :title="$t('button.save')" @click="saveHostParam(item, false)">
              <span class="sr-only">{{ $t('button.save') }}</span>
              <b-icon :icon="icon.check" />
            </b-button>
          </template>
        </GridGFormItem>
      </span>
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
import { SaveParameters } from '../../mixins/save'
const auth = namespace('auth')
const changes = namespace('changes')
const errors = namespace('errors')

@Component({ mixins: [Icons, SaveParameters] })
export default class GChangesHostParam extends Vue {
  filter: string = ''
  $axios: any
  $t: any
  $nuxt: any
  icon:any
  saveParameters:any
  @auth.Getter public username!: string
  @errors.Getter public errorsHostParam!: Array<any>
  @errors.Mutation public clearErrorsHostParam!: () => void
  @changes.Getter public changesHostParam!: Array<any>
  @changes.Mutation public delFromChangesHostParam!: (s: object) => void

  async saveHostParam (item: any, saveAll:boolean) {
    let url: string = ''
    let request: any = []
    let showalert: any = true
    if (saveAll) {
      showalert = false
    }
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
    await this.saveParameters(url, request, item, showalert)
  }

  async saveAllHostParam () {
    const ref = (this.$refs.changesHostParamAlert as any)
    const changelist = this.changesHostParam.filter(o => o.user === this.username)
    const saveAll = true
    for (const count in changelist) {
      const item = changelist[count]
      await this.saveHostParam(item, saveAll)
    }
    if (this.errorsHostParam.length !== 0) {
      ref.alert(this.$t('message.error.title'), 'danger', this.errorsHostParam)
      // this.showToastError(error)
      this.clearErrorsHostParam()
    }
  }
}
</script>
