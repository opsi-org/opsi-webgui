<template>
  <div data-testid="MTrackChanges" class="MTrackChanges">
    <b-button
      v-if="!quicksave && (changesProducts.filter((o) => o.user === username).length!==0 || changesHostParam.filter((o) => o.user === username).length!==0)"
      class="mt-2"
      variant="primary"
      @click="$bvModal.show('trackChangesModal')"
    >
      <b-icon
        v-b-tooltip.hover
        :title="$t('button.track.changes')"
        :icon="iconnames.trackchanges"
      />
      <span v-if="$mq!='mobile'" class="btnlabel"> {{ $t('button.track.changes') }} </span>
    </b-button>
    <b-modal
      id="trackChangesModal"
      data-testid="MTrackChanges"
      size="xl"
      :title="$t('button.track.changes')"
      hide-footer
      no-fade
    >
      <b-tabs>
        <b-tab v-if="changesHostParam.filter((o) => o.user === username).length!==0" :title="$t('Host Parameters')" active>
          <FormFHostParamChanges :changes="changesHostParam" />
          <!-- {{ changesHostParam }} -->
        </b-tab>
        <b-tab v-if="changesProducts.filter(o => o.user === username).length !== 0" :title="$t('Product Actions and Properties')">
          <AlertAAlert ref="trackChangesAlert" />
          <TableTChanges />
          <DivDComponentGroup v-if="changesProducts.filter(o => o.user === username).length !== 0" class="float-right">
            <ButtonBTNClearChanges hide="trackChangesModal" />
            <b-button variant="success" :title="$t('button.saveall')" @click="saveAll()">
              <b-icon :icon="iconnames.save" />
              <span class="saveall">{{ $t('button.saveall') }}</span>
            </b-button>
          </DivDComponentGroup>
        </b-tab>
      </b-tabs>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, namespace } from 'nuxt-property-decorator'
import { ChangeObj } from '../../.utils/types/tchanges'
import { Constants } from '../../mixins/uib-mixins'
const auth = namespace('auth')
const settings = namespace('settings')
const changes = namespace('changes')

@Component({ mixins: [Constants] })
export default class MTrackChanges extends Vue {
  iconnames: any
  $nuxt: any
  $axios: any
  $t:any
  changelist: Array<ChangeObj> = []
  error: string = ''

  @Prop() child!: boolean
  @Prop() closeroute!: string
  @auth.Getter public username!: string
  @settings.Getter public quicksave!: boolean
  @changes.Getter public changesProducts!: Array<ChangeObj>
    @changes.Getter public changesHostParam!: Array<ChangeObj>
  @changes.Mutation public delFromChangesProducts!: (s: object) => void

  async saveProd (item: ChangeObj) {
    const change = {
      clientIds: [item.clientId],
      productIds: [item.productId],
      actionRequest: item.actionRequest
    }

    await this.$axios.$post('/api/opsidata/clients/products', change)
      .then((response) => {
        // eslint-disable-next-line no-console
        console.log(response)
        this.delFromChangesProducts(item)
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        this.error = detailedError
      })
  }

  async saveProdProp (item: ChangeObj) {
    // const t:any = this
    const propObj: any = {}
    propObj[item.property] = item.propertyValue
    let change = {}
    if (item.clientId !== '') {
      change = {
        clientIds: [item.clientId],
        properties: propObj
      }
    } else {
      change = {
        depotIds: [item.depotId],
        properties: propObj
      }
    }
    await this.$axios.$post(`/api/opsidata/products/${item.productId}/properties`, change)
      .then((response) => {
        // eslint-disable-next-line no-console
        console.log(response)
        // makeToast(t, 'Product Property ' + JSON.stringify(change) + ' saved succefully', this.$t('message.success.title') as string, 'success')
        this.delFromChangesProducts(item)
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        this.error = detailedError
        // makeToast(t, (error as IObjectString2Any).message, this.$t('message.error.title') as string, 'danger', 8000)
      })
  }

  async saveAll () {
    this.changelist = this.changesProducts.filter(o => o.user === this.username)
    for (const p in this.changelist) {
      const change = this.changelist[p]
      if (change.actionRequest) {
        await this.saveProd(change)
      } else if (change.property) {
        await this.saveProdProp(change)
      }
    }
    if (this.error) {
      const ref = (this.$refs.trackChangesAlert as any)
      ref.alert(this.$t('message.error.title'), 'danger', this.error)
    } else {
      const ref = (this.$refs.trackChangesAlert as any)
      ref.alert(this.$t('message.success.trackChanges.saveAll'), 'success')
      this.$nuxt.refresh()
    }
  }
}
</script>

<style>
.MTrackChanges .modal-header .close {
  color: var(--color, var(--primary, black));
}
.MTrackChanges .modal-dialog {
  left: 0% !important;
  top:10% !important;
}
</style>
