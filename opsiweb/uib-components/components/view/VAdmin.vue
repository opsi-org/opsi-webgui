<template>
  <div data-testid="VAdmin" class="VAdmin">
    <b-row class="mt-4 mb-2 text-small">
      <b>{{ $t('Clients') }}</b>
    </b-row>
    <GridGFormItem>
      <template #label>
        <span>{{ $t('Blocked Clients') }}</span>
      </template>
      <template #value>
        <b-button variant="outiline-primary" class="w-25" size="sm" @click="unblockAllClients()">
          {{ $t('Unblock All') }}
        </b-button>
      </template>
    </GridGFormItem>
    <b-row class="mt-4 mb-2 text-small">
      <b>{{ $t('Products') }} </b>
    </b-row>
    <GridGFormItem>
      <template #label>
        <span>{{ $t('Locked Products') }}</span>
      </template>
      <template #value>
        <b-button variant="outiline-primary" class="w-25" size="sm" @click="unlockAllProducts()">
          {{ $t('Unlock All') }}
        </b-button>
      </template>
    </GridGFormItem>
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

  async unblockAllClients () {
    const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
    await this.$axios.$post('/api/opsidata/clients/unblock')
      .then((response) => {
        ref.alert(this.$t('message.success.title'), 'success', response)
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        ref.alert(this.$t('message.error.title') as string, 'danger', detailedError)
      })
  }

  async unlockAllProducts () {
    const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
    await this.$axios.$post('/api/opsidata/products/unlock')
      .then((response) => {
        ref.alert(this.$t('message.success.title'), 'success', response)
      }).catch((error) => {
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
