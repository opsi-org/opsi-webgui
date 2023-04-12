<template>
  <div data-testid="VAdmin" class="VAdmin">
    <b-row class="mt-4 mb-2">
      <b>{{ $t('Clients') }} </b>
    </b-row>
    <!-- <GridGFormItem>
      <template #label>
        <span>{{ $t('Select a client- TODO::fetch list of blocked clients') }}</span>
      </template>
      <template #value>
        <b-button variant="outiline-primary">
          {{ $t('Unblock') }}
        </b-button>
      </template>
    </GridGFormItem> -->
    <GridGFormItem>
      <template #label>
        <span>{{ $t('Blocked Clients') }}</span>
      </template>
      <template #value>
        <b-button variant="outiline-primary" @click="unblockAllClients()">
          {{ $t('Unblock All') }}
        </b-button>
      </template>
    </GridGFormItem>
    <b-row class="mt-4 mb-2">
      <b>{{ $t('Products') }} </b>
    </b-row>
    <!-- <GridGFormItem>
      <template #label>
        <span>{{ $t('Select a product TODO::fetch list of locked products') }}</span>
      </template>
      <template #value>
        <b-button variant="outiline-primary">
          {{ $t('Unlock') }}
        </b-button>
      </template>
    </GridGFormItem> -->
    <GridGFormItem>
      <template #label>
        <span>{{ $t('Locked Products') }}</span>
      </template>
      <template #value>
        <b-button variant="outiline-primary" @click="unlockAllProducts()">
          {{ $t('Unlock All') }}
        </b-button>
      </template>
    </GridGFormItem>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { MBus } from '../../mixins/uib-mixins'
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

  // wsBusMsg: any // mixin // store
  // wsSubscribe: any
  // html: string = '<h1>hi1</h1>'

  // @Watch('wsBusMsg', { deep: true }) _wsBusMsgObjectChanged2 () {
  //   const msg = this.wsBusMsg
  //   console.log('MessageBus: receive-watch: ', msg)
  //   if (msg && msg.type.startsWith('terminal_')) {
  //     const ref = (this.$root.$children[1].$refs.messageBusInfo as any) || (this.$root.$children[2].$refs.messageBusInfo as any)
  //     ref.alert(`MessageBus received:  terminal ${msg.data}`, 'info')
  //     // await this.$fetch()
  //   }
  // }

  // mount () {
  //   // this.wsSubscribe(['terminal'])
  // }
}
</script>

<style scoped>
.console {
  min-height: 100px;
  min-width: 100px;
  font-family: monospace;
  text-align: left;
  background-color: black;
  color: #fff;
  overflow-y: auto;
}
.VAdmin {
  overflow-x: hidden;
  padding-left: 10px;
}
</style>
