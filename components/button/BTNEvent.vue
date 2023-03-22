<template>
  <div
    :title="withText == false ? $t(events[event].tooltip) : ''"
    data-testid="BTNEvent"
  >
    <b-button
      v-if="incontextmenu == false"
      :pressed="isLoading"
      :disabled="isLoading || (event=='ondemand' && selection.length <= 0)"
      :variant="events[event].variant"
      :class="{
        [classes]: true,
        'w-100 h-100 text-left border-0': true
      }"
      :size="size"
      @click="$bvModal.show('event-modal-' + event + '-' + data)"
    >
      <b-icon v-if="events[event].icon" :icon="events[event].icon" />
      {{ (!isLoading) ? $t(events[event].title) : '' }}
      <span class="eventlabel" :class="event"> {{ (withText || event=='reboot' || event=='showpopup')? $t(events[event].titlemodal) : '' }} </span>
      <IconILoading v-if="isLoading" :small="true" />
    </b-button>
    <li
      v-else
      :pressed="isLoading"
      :disabled="isLoading || (event=='ondemand' && selection.length <= 0)"
      :variant="events[event].variant"
      :size="size"
      :class="{
        [classes]: true
      }"
      @click="$bvModal.show('event-modal-' + event + '-' + data)"
      @keypress.enter="$bvModal.show('event-modal-' + event + '-' + data)"
    >
      <b-icon v-if="events[event].icon" :icon="events[event].icon" />
      {{ (!isLoading) ? $t(events[event].title) : '' }}
      <span class="eventlabel" :class="event"> {{ (withText || incontextmenu || event=='reboot' || event=='showpopup')? $t(events[event].titlemodal) : '' }} </span>
      <IconILoading v-if="isLoading" :small="true" />
    </li>

    <b-modal
      :id="'event-modal-' + event + '-' + data"
      :title="$t(events[event].titlemodal)"
      data-testid="BTNEventModal"
      centered
      scrollable
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
      <b-list-group v-else-if="event=='showpopup'" flush>
        <b-form-textarea v-model="eventdata.popup.msg" :placeholder="$t('button.event.showpopup.message')" class="textarea" />
        {{ data }}
      </b-list-group>
      <div v-else class="modal-client-p">
        {{ data }}
      </div>

      <template #modal-footer>
        <p class="float-left footer">
          {{ $t('button.event.modal.footer', { event }) }}
        </p>
        <b-button
          variant="success"
          size="sm"
          class="float-right confirm"
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
  $axios: any
  iconnames: any
  $t: any

  isLoading:any = false
  show:boolean = false
  selectionClientsDelete: Array<string> = []

  eventdata: any = { popup: { msg: '' } }
  // eventdata: any = { popup: { msg: this.$t('button.event.showpopup.message') as string } }

  @selections.Getter public selectionClients!: Array<string>

  @Prop({ default: 'ondemand' }) event!: string
  @Prop({ default: '' }) classes!: string
  @Prop({ default: false }) incontextmenu!: boolean
  @Prop({ default: false }) withText!: boolean
  @Prop({ default: 'sm' }) size!: string
  @Prop({ default: undefined }) data?: any
  @Prop({ default: undefined }) isLoadingParent ?: boolean|undefined
  @Prop({ default: undefined }) updateLoading ?: Function|undefined

  get events () {
    return {
      showpopup: {
        tooltip: 'button.event.showpopup.tooltip',
        titlemodal: 'button.event.showpopup',
        icon: this.iconnames.message,
        variant: 'outline-primary',

        params: {
          method: 'showPopup',
          params: ['Dummy text']
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
    if (this.data) {
      return [this.data]
    }
    return this.selectionClients.filter(c => !this.selectionClientsDelete.includes(c))
  }

  async callEvent () {
    if (!this.event || this.events[this.event] === undefined) {
      // eslint-disable-next-line no-console
      console.error(`event ${this.event} not found in ${Object.keys(this.events)}`)
      return
    }
    this.isLoading = true
    const data = this.events[this.event]
    const ref = (this.$root.$children[1].$refs.ondemandMessage as any) || (this.$root.$children[2].$refs.ondemandMessage as any)

    if (this.event === 'ondemand') { data.params.client_ids = this.selection }
    if (this.event === 'reboot') { data.params.client_ids = [this.data] }
    if (this.event === 'showpopup') {
      data.params.client_ids = this.selection
      data.params.params = [this.eventdata.popup.msg]
    }

    if (this.updateLoading !== undefined) {
      this.updateLoading(data.params.client_ids)
    }

    await this.$axios.$post('/api/command/opsiclientd_rpc', data.params)
      .then((response) => {
        data.responseVisualization(ref, response)
        this.isLoading = false
        if (this.updateLoading !== undefined) { this.updateLoading([]) }
      }).catch((error) => {
        const detailedError = ((error && error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.event') as string + ' "' + this.event + '"', 'danger', detailedError || '')
        this.isLoading = false

        if (this.updateLoading !== undefined) { this.updateLoading([]) }
      })
    this.$bvModal.hide('event-modal-' + this.event + '-' + this.data)
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
    // eslint-disable-next-line no-console
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
.smaller-text-size > .eventlabel{
  font-size: 85% !important;
}
</style>
