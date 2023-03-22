<template>
  <div data-testid="VAdminTerminal" class="VAdminTerminal">
    <!-- <div class="console" v-html="html"> hii </div> -->
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
</style>
