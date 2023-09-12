<template>
  <div data-testid="VAdmin" class="VAdmin">
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

    <AlertAAlertLocal v-else show alert-variant="light">
      {{ $t('label.blockedclients.null') }}
    </AlertAAlertLocal>

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
    <AlertAAlertLocal v-else show alert-variant="light">
      {{ $t('label.lockedproducts.null') }}
    </AlertAAlertLocal>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { MBus } from '../../mixins/messagebus'
const cache = namespace('data-cache')

@Component({ mixins: [MBus] })
export default class VAdminTerminal extends Vue {
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
      }).catch((error) => {
        const ref = (this.$root.$children[1].$refs.errorAlert as any) || (this.$root.$children[2].$refs.errorAlert as any)
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        ref.alert(detailedError, 'danger')
      })
  }

  async fetchLockedProducts () {
    await this.$axios.$get('/api/opsidata/locked-products')
      .then((response) => {
        this.lockedProducts = response
      }).catch((error) => {
        const ref = (this.$root.$children[1].$refs.errorAlert as any) || (this.$root.$children[2].$refs.errorAlert as any)
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        ref.alert(detailedError, 'danger')
      })
  }

  async unblockClient () {
    await this.$axios.$post(`/api/opsidata/clients/${this.clientId}/unblock`)
      .then((response) => {
        const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
        ref.alert(response, 'success')
      })
      .catch((error) => {
        const ref = (this.$root.$children[1].$refs.errorAlert as any) || (this.$root.$children[2].$refs.errorAlert as any)
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        ref.alert(this.$t('message.error.title') as string, 'danger', detailedError)
      })
  }

  async unlockProduct () {
    await this.$axios.$post(`/api/opsidata/products/${this.productId}/unlock`)
      .then((response) => {
        const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
        ref.alert(response, 'success')
      })
      .catch((error) => {
        const ref = (this.$root.$children[1].$refs.errorAlert as any) || (this.$root.$children[2].$refs.errorAlert as any)
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        ref.alert(this.$t('message.error.title') as string, 'danger', detailedError)
      })
  }

  async unblockAllClients () {
    await this.$axios.$post('/api/opsidata/clients/unblock')
      .then((response) => {
        const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
        ref.alert(this.$t('message.success.title'), 'success', response)
      }).catch((error) => {
        const ref = (this.$root.$children[1].$refs.errorAlert as any) || (this.$root.$children[2].$refs.errorAlert as any)
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        ref.alert(this.$t('message.error.title') as string, 'danger', detailedError)
      })
  }

  async unlockAllProducts () {
    await this.$axios.$post('/api/opsidata/products/unlock')
      .then((response) => {
        const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
        ref.alert(this.$t('message.success.title'), 'success', response)
      }).catch((error) => {
        const ref = (this.$root.$children[1].$refs.errorAlert as any) || (this.$root.$children[2].$refs.errorAlert as any)
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        ref.alert(this.$t('message.error.title') as string, 'danger', detailedError)
      })
  }
}
</script>

<style scoped>
.VAdmin {
  overflow-x: hidden;
  padding-left: 10px;
}
</style>
