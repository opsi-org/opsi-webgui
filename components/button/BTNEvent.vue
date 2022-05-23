<template>
  <b-button
    variant="primary"
    :pressed="isLoading"
    :disabled="isLoading"
    :title="$t(events[event].tooltip)"
    @click="callEvent"
  >
    {{ (!isLoading) ? $t(events[event].title) : '' }}
    <IconILoading v-if="isLoading" :small="true" />
  </b-button>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
const selections = namespace('selections')

@Component({ mixins: [Constants] })
export default class BTNEvent extends Vue {
  iconnames:any

  isLoading:any = false

  @selections.Getter public selectionClients!: string

  @Prop({ default: 'ondemand' }) event?: string

  events: any = {
    ondemand: {
      // event: 'on_demand',
      tooltip: 'button.event.ondemand.tooltip',
      title: 'button.event.ondemand',
      params: {
        method: 'fireEvent',
        params: ['on_demand'],
        client_ids: this.selectionClients
      },
      responseVisualization: this.showResult_ondemand

    }
  }

  async callEvent () {
    if (this.events[this.event] === undefined) {
      console.error(`event ${this.event} not found. ${this.events[this.event]}`)
      return
    }
    this.isLoading = true
    const ref = (this.$root.$children[1].$refs.ondemandMessage as any) || (this.$root.$children[2].$refs.ondemandMessage as any)
    // const ref = this.$refs.ondemandMessage as any

    // hostControl_showPopup

    // const params = { method: 'fireEvent', params: ['on_demand'], client_ids: this.selectionClients }
    if (this.event === 'ondemand') { this.events[this.event].params.client_ids = this.selectionClients }
    await this.$axios.$post('/api/command/opsiclientd_rpc', this.events[this.event].params)
      .then((response) => {
        this.events[this.event].responseVisualization(ref, response)
        this.isLoading = false
      }).catch((error) => {
      // eslint-disable-next-line no-console
        console.error(JSON.stringify(error))
        const detailedError = ((error && error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.event') as string + ' "' + this.event + '"', 'danger', detailedError || '')
        this.isLoading = false
      })
  }

  showResult_ondemand (ref:any, response:any) {
    ref.set('object', response)
    ref.alert(this.$t('message.info.event') as string + ' "' + this.event + '"', 'info')
  }
}
</script>
