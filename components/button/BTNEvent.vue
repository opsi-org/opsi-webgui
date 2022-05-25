<template>
  <!-- variant="primary" -->
  <b-button
    :pressed="isLoading"
    :disabled="isLoading"
    :title="$t(events[event].tooltip)"
    :variant="events[event].variant"
    class="border-0"
    :size="size"
    @click="callEvent"
  >
    <b-icon v-if="events[event].icon" :icon="events[event].icon" />
    {{ (!isLoading) ? $t(events[event].title) : '' }}
    <IconILoading v-if="isLoading" :small="true" />
    {{ (event!='ondemand' || selectionClients.length<=0)?'': selectionClients.length + ' clients' }}
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

  @Prop({ default: 'ondemand' }) event!: string
  @Prop({ default: 'sm' }) size!: string
  @Prop({ default: undefined }) data?: any

  get events () {
    return {
      showpopup: {
        tooltip: 'button.event.showpopup.tooltip',
        // title: 'button.event.showpopup',
        icon: this.iconnames.message,
        variant: 'outline-primary',
        params: {
          method: 'showPopup',
          params: ['Hallo - Nachricht ist von Anna. Bitte schreiben wenn jemand es sieht :D']
          // client_ids: this.selectionClients
        },
        responseVisualization: this.showResultOndemand
      },
      ondemand: {
        tooltip: 'button.event.ondemand.tooltip',
        // title: 'button.event.ondemand',
        variant: 'primary',
        icon: this.iconnames.ondemand,
        params: {
          method: 'fireEvent',
          params: ['on_demand'],
          client_ids: this.selectionClients
        },
        responseVisualization: this.showResultOndemand
      },
      reboot: {
        // event: 'on_demand',
        tooltip: 'button.event.reboot.tooltip',
        // title: 'button.event.reboot',
        icon: this.iconnames.reboot,
        variant: 'outline-primary',
        params: {
          method: 'reboot',
          params: [],
          client_ids: this.selectionClients
        },
        responseVisualization: this.showResultOndemand
      }
    }
  }

  async callEvent () {
    if (!this.event || this.events[this.event] === undefined) {
      // eslint-disable-next-line no-console
      console.error(`event ${this.event} not found in ${Object.keys(this.events)}`)
      return
    }
    this.isLoading = true
    const eventData = this.events[this.event]
    const ref = (this.$root.$children[1].$refs.ondemandMessage as any) || (this.$root.$children[2].$refs.ondemandMessage as any)
    // const ref = this.$refs.ondemandMessage as any

    // hostControl_showPopup

    // const params = { method: 'fireEvent', params: ['on_demand'], client_ids: this.selectionClients }
    if (this.event === 'ondemand') { eventData.params.client_ids = this.selectionClients }
    if (this.event === 'reboot') { eventData.params.client_ids = [this.data] }
    if (this.event === 'showpopup') { eventData.params.client_ids = [this.data] }
    // if (this.event === 'showpopup') {
    //   eventData.params.client_ids = [this.data || '']
    //   eventData.params.params[1] = this.data || ''
    // }
    await this.$axios.$post('/api/command/opsiclientd_rpc', eventData.params)
      .then((response) => {
        eventData.responseVisualization(ref, response)
        this.isLoading = false
      }).catch((error) => {
      // eslint-disable-next-line no-console
        console.error(JSON.stringify(error))
        const detailedError = ((error && error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.event') as string + ' "' + this.event + '"', 'danger', detailedError || '')
        this.isLoading = false
      })
  }

  showResultOndemand (ref:any, response:any) {
    const data:any = {}
    for (const k in response) {
      if (response[k].error) {
        data[k] = { error: 'Error' }
      } else {
        data[k] = { result: 'Success' }
      }
    }
    console.error('Response: ', data)
    ref.set('object', data)
    ref.alert(this.$t('message.info.event') as string + ' "' + this.event + '"', 'info')
  }
}
</script>
