<template>
  <div data-testid="MTrackChanges">
    <b-button
      v-if="expert && changesProducts.filter((o) => o.user === username).length!==0"
      v-b-tooltip.hover
      :title="$t('button.track.changes')"
      @click="$bvModal.show('trackChangesModal')"
    >
      <b-icon class="bg-success" font-scale="2" :icon="iconnames.save" />
    </b-button>
    <b-modal
      id="trackChangesModal"
      data-testid="MTrackChanges"
      size="xl"
      :title="$t('button.track.changes')"
      hide-footer
    >
      <template v-if="changesProducts.filter(o => o.user === username).length !== 0">
        <TableTChanges />
        <ButtonBTNClearChanges />
        <b-button class="float-right" size="sm" variant="success" :title="$t('button.saveall')" @click="saveAll()">
          <b-icon :icon="iconnames.save" />
          {{ $t('button.saveall') }}
        </b-button>
      </template>
      <template v-else>
        -- No changes to track --
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, namespace } from 'nuxt-property-decorator'
import { makeToast } from '../../.utils/utils/scomponents'
import { IObjectString2Any } from '../../.utils/types/tgeneral'
import { ChangeObj } from '../../.utils/types/tchanges'
import { Constants } from '../../mixins/uib-mixins'
const settings = namespace('settings')
const changes = namespace('changes')

@Component({ mixins: [Constants] })
export default class MTrackChanges extends Vue {
  iconnames: any
  $axios: any
  changelist: Array<ChangeObj> = []

  @Prop() child!: boolean;
  @Prop() closeroute!: string;
  @settings.Getter public expert!: boolean
  @changes.Getter public changesProducts!: Array<ChangeObj>;
  @changes.Mutation public delFromChangesProducts!: (s: object) => void

  get username () {
    return localStorage.getItem('username')
  }

  async saveProd (item: ChangeObj) {
    const change = {
      clientIds: [item.clientId],
      productIds: [item.productId],
      actionRequest: item.actionRequest
    }
    const t:any = this

    await this.$axios.$post('/api/opsidata/clients/products', change)
      .then((response) => {
        // eslint-disable-next-line no-console
        console.log(response)
        makeToast(t, 'Action request ' + JSON.stringify(change) + ' saved successfully', this.$t('message.success') as string, 'success')
        this.delFromChangesProducts(item)
        // this.setSession()
      }).catch((error) => {
        makeToast(t, (error as IObjectString2Any).message, this.$t('message.error') as string, 'danger')
      })
    // if (this.changelist.length === 0) {
    //   this.$bvModal.hide('ProductSaveModal')
    //   this.$nuxt.refresh()
    // }
  }

  async saveProdProp (item: ChangeObj) {
    const t:any = this
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
        makeToast(t, 'Product Property ' + JSON.stringify(change) + ' saved succefully', this.$t('message.success') as string, 'success')
        this.delFromChangesProducts(item)
        // this.setSession()
      }).catch((error) => {
        makeToast(t, (error as IObjectString2Any).message, this.$t('message.error') as string, 'danger', 8000)
      })
    // if (this.changelist.length === 0) {
    //   this.$bvModal.hide('ProductSaveModal')
    //   this.$nuxt.refresh()
    // }
  }

  saveAll () {
    this.changelist = this.changesProducts.filter(o => o.user === this.username)
    for (const p in this.changelist) {
      const change = this.changelist[p]
      if (change.actionRequest) {
        this.saveProd(change)
      } else if (change.property) {
        this.saveProdProp(change)
      }
    }
  }
}
</script>

<style>
</style>
