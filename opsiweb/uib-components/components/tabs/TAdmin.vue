<template>
  <div data-testid="TAdmin" class="TAdmin">
    <b-tabs small lazy>
      <b-tab :title="$t('form.general')" active>
        <b-row class="mt-4 mb-2 text-small">
          <b class="titleclients">{{ $t('title.clients') }}</b>
        </b-row>
        <template v-if="blockedClients.length > 1">
          <GridGFormItem :label="$t('label.blockedclients.select')" variant="longvalue">
            <template #value>
              <b-input-group>
                <b-form-select :options="blockedClients" />
                <template #append>
                  <b-button v-model="clientId" variant="outiline-primary" size="sm" @click="unblockClient()">
                    {{ $t('label.unblock') }}
                  </b-button>
                </template>
              </b-input-group>
            </template>
          </GridGFormItem>
          <GridGFormItem :label="$t('label.blockedclients')" variant="longvalue">
            <template #value>
              <b-button variant="outiline-primary" block size="sm" @click="unblockAllClients()">
                {{ $t('label.unblock.all') }}
              </b-button>
            </template>
          </GridGFormItem>
        </template>
        <span v-else class="text-small ml-2">
          {{ $t('label.blockedclients.null') }}
        </span>

        <b-row class="mt-4 mb-2 text-small">
          <b class="titleproducts">{{ $t('title.products') }} </b>
        </b-row>
        <template v-if="lockedProducts.length > 1">
          <GridGFormItem :label="$t('label.lockedproducts.select')" variant="longvalue">
            <template #value>
              <b-input-group>
                <b-form-select :options="lockedProducts" />
                <template #append>
                  <b-button v-model="productId" variant="outiline-primary" size="sm" @click="unlockProduct()">
                    {{ $t('label.unlock') }}
                  </b-button>
                </template>
              </b-input-group>
            </template>
          </GridGFormItem>
          <GridGFormItem :label="$t('label.lockedproducts')" variant="longvalue">
            <template #value>
              <b-button variant="outiline-primary" block size="sm" @click="unlockAllProducts()">
                {{ $t('label.unlock.all') }}
              </b-button>
            </template>
          </GridGFormItem>
        </template>
        <span v-else show class="text-small ml-2">
          {{ $t('label.lockedproducts.null') }}
        </span>
      </b-tab>
      <b-tab :title="$t('label.maintenance')">
        <ViewVAdminMaintenance />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { AlertToast } from '../../mixins/component'
import { MBus } from '../../mixins/messagebus'
const cache = namespace('data-cache')

@Component({ mixins: [MBus, AlertToast] })
export default class VAdminTerminal extends Vue {
  showToastError: any // from mixin AlertToast
  showToastSuccess: any // from mixin AlertToast
  @Prop({ }) id!: string
  @Prop({ }) type!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string
  @cache.Getter public opsiconfigserver!: string
  $axios: any
  $t: any
  blockedClients: Array<string> = []
  lockedProducts: Array<string> = []
  clientId: string = ''
  productId: string = ''

  async mounted () {
    await this.fetchBlockedClients()
    await this.fetchLockedProducts()
  }

  async fetchBlockedClients () {
    await this.$axios.$get('/api/opsidata/blocked-clients')
      .then((response) => {
        this.blockedClients = response
      }).catch(this.showToastError)
  }

  async fetchLockedProducts () {
    await this.$axios.$get('/api/opsidata/locked-products')
      .then((response) => {
        this.lockedProducts = response
      }).catch(this.showToastError)
  }

  async unblockClient () {
    await this.$axios.$post(`/api/opsidata/clients/${this.clientId}/unblock`)
      .then((response) => { this.showToastSuccess(response) })
      .catch(this.showToastError)
  }

  async unlockProduct () {
    await this.$axios.$post(`/api/opsidata/products/${this.productId}/unlock`)
      .then((response) => { this.showToastSuccess(response) })
      .catch(this.showToastError)
  }

  async unblockAllClients () {
    await this.$axios.$post('/api/opsidata/clients/unblock')
      .then((response) => { this.showToastSuccess(response) })
      .catch(this.showToastError)
  }

  async unlockAllProducts () {
    await this.$axios.$post('/api/opsidata/products/unlock')
      .then((response) => { this.showToastSuccess(response) })
      .catch(this.showToastError)
  }
}
</script>

<style scoped>
.VAdmin {
  overflow-x: hidden;
  padding-left: 10px;
}
</style>
