<template>
  <div
    :title="$t(events[event].tooltip)"
  >
    <!-- {{isLoadingParent}} -->
    <b-button
      :pressed="isLoading"
      :disabled="isLoading || (event=='ondemand' && selection.length <= 0)"
      :variant="events[event].variant"
      :class="{
        'w-100 h-100 text-left': true,
      }"
      :size="size"
      @click="show=true"
    >
      <!-- class="border-0" -->
        <!-- 'pl-3': event=='ondemand' && $mq=='mobile' -->
      <b-icon v-if="events[event].icon" :icon="events[event].icon" />
      {{ (!isLoading) ? $t(events[event].title) : '' }}
      {{ (event=='reboot')? $t(events[event].titlemodal) : '' }}
      <IconILoading v-if="isLoading" :small="true" />
      <!-- {{ (event!='ondemand' || selectionClients.length<=0)?'': selectionClients.length + ' clients' }} -->
    </b-button>

    <b-modal
      v-model="show"
      :title="$t(events[event].titlemodal)"
      size="sm"
    >
      <b-list-group v-if="event=='ondemand'" flush>
        <!-- <b-list-group-item>Cras justo odio</b-list-group-item> -->
        <b-list-group-item v-for="c in selection" :key="c" class="modal-client-p">
          {{ c }}
          <b-button
            class="border-0 float-right"
            variant="outline-primary"
            :title="$t('button.delete')"
            size="sm"
            @click="selectionClientsDelete.push(c)"
          >
            <span class="sr-only">{{ $t('button.reset') }}</span>
            <b-icon :icon="iconnames.x" />
          </b-button>
        </b-list-group-item>
      </b-list-group>
      <div v-else class="modal-client-p">
        {{ data }}
      </div>

      <template #modal-footer>
        <p class="float-left">
          {{ $t('button.event.modal.footer', { event }) }}
        </p>
        <b-button
          variant="primary"
          size="sm"
          class="float-right"
          @click="show=false"
        >
          {{ $t('button.close') }}
        </b-button>
        <b-button
          variant="success"
          size="sm"
          class="float-right"
          @click="callEvent(); show=false"
        >
          {{ $t('button.confirm') }}
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
const selections = namespace('selections')

@Component({ mixins: [Constants] })
export default class BTNEvent extends Vue {
  iconnames:any

  isLoading:any = false
  show:boolean = false
  selectionClientsDelete: Array<string> = []

  @selections.Getter public selectionClients!: Array<string>

  @Prop({ default: 'ondemand' }) event!: string
  @Prop({ default: 'sm' }) size!: string
  @Prop({ default: undefined }) data?: any
  @Prop({ default: undefined }) isLoadingParent ?: boolean|undefined

  get events () {
    return {
      showpopup: {
        tooltip: 'button.event.showpopup.tooltip',
        titlemodal: 'button.event.showpopup',
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
        titlemodal: 'button.event.ondemand',
        variant: 'outline-primary',
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
        titlemodal: 'button.event.reboot',
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

  get selection () {
    return this.selectionClients.filter(c => !this.selectionClientsDelete.includes(c))
  }

  async callEvent () {
    if (!this.event || this.events[this.event] === undefined) {
      // eslint-disable-next-line no-console
      console.error(`event ${this.event} not found in ${Object.keys(this.events)}`)
      return
    }
    this.isLoading = true
    if (this.isLoadingParent !== undefined) {
      console.warn('Update ParentLoading ', this.isLoading)
      this.$emit('update:isLoadingParent', true)
    }
    console.warn('ParentLoading ', this.isLoadingParent)

    const eventData = this.events[this.event]
    const ref = (this.$root.$children[1].$refs.ondemandMessage as any) || (this.$root.$children[2].$refs.ondemandMessage as any)
    // const ref = this.$refs.ondemandMessage as any

    // hostControl_showPopup

    // const params = { method: 'fireEvent', params: ['on_demand'], client_ids: this.selectionClients }
    if (this.event === 'ondemand') {
      eventData.params.client_ids = this.selection
    }
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
        if (this.isLoadingParent !== undefined) { this.$emit('update:isLoadingParent', false) }
      }).catch((error) => {
      // eslint-disable-next-line no-console
        console.error(JSON.stringify(error))
        const detailedError = ((error && error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.event') as string + ' "' + this.event + '"', 'danger', detailedError || '')
        this.isLoading = false
        if (this.isLoadingParent !== undefined) { this.$emit('update:isLoadingParent', false) }
      })
  }

  showResultOndemand (ref:any, response:any) {
    const data:any = {}
    for (const k in response) {
      if (response[k].error) {
        data[k] = { error: this.$t('message.error.title') }
      } else {
        data[k] = { result: this.$t('message.success.title') }
      }
    }
    console.error('Response: ', data)
    ref.set('object', data)
    ref.alert(this.$t('message.info.event') as string + ' "' + this.event + '"', 'info')
  }
}
</script>
<style>
.modal-client-p {
  margin: 0px !important;
  padding: 0px !important;
  border: 0px !important;
  min-width: 100%;
}
</style>
