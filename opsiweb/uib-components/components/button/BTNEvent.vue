<template>
  <div
    data-testid="BTNEvent"
    :class="{'incontextmenu': incontextmenu }"
    :title="withText == false ? $t(events[event].tooltip) : ''"
  >
    <b-button
      v-if="incontextmenu === false"
      :pressed="isLoading"
      :disabled="isLoading || (event=='ondemand' && selection.length <= 0)"
      :variant="events[event].variant"
      :class="{
        'w-100 h-100': true,
        [classes]: true

      }"
      size="sm"
      @click="$bvModal.show('event-modal-' + event + '-' + data + '-context-menu-' + incontextmenu)"
    >
      <b-icon v-if="events[event].icon" :icon="events[event].icon" />
      {{ (!isLoading) ? $t(events[event].title) : '' }}
      <span class="eventlabel" :class="event"> {{ (withText || event=='reboot' || event=='showpopup')? $t(events[event].titlemodal) : '' }} </span>
      <IconILoading v-if="isLoading" :small="true" />
    </b-button>
    <div
      v-else
      variant="outline-primary"
      size="sm"
      class="w-100 h-100 text-left border-0 incontextmenu contextmenu pl-4  pt-1 pb-2 "
      :disabled="isLoading || (event=='ondemand' && selection.length <= 0)"
      @click="$bvModal.show('event-modal-' + event + '-' + data + '-context-menu-' + incontextmenu)"
      @keypress.enter="$bvModal.show('event-modal-' + event + '-' + data + '-context-menu-' + incontextmenu)"
    >
      <b-icon v-if="events[event].icon" :icon="events[event].icon" />
      {{ (!isLoading) ? $t(events[event].title) : '' }}
      <span class="eventlabel" :class="event"> {{ (withText || incontextmenu || event=='reboot' || event=='showpopup')? $t(events[event].titlemodal) : '' }} </span>
      <IconILoading v-if="isLoading" :small="true" />
    </div>

    <b-modal
      :id="'event-modal-' + event + '-' + data + '-context-menu-' + incontextmenu"
      :title="$t(events[event].titlemodal)"
      data-testid="BTNEventModal"
      centered
      scrollable
    >
      <b-list-group v-if="event=='ondemand'" flush>
        <b-list-group-item v-for="c in selection" :key="c" class="modal-client-p text-small">
          {{ c }}
          <b-button
            class="border-0 float-right text-small"
            variant="outline-primary"
            :title="$t('button.delete')"
            size="sm"
            @click="selectionClientsDelete.push(c)"
          >
            <span class="sr-only">{{ $t('button.reset') }}</span>
            <b-icon :icon="icon.x" />
          </b-button>
        </b-list-group-item>
      </b-list-group>
      <b-list-group v-else-if="event=='showpopup'" class="text-small" flush>
        <b-form-textarea v-model="eventdata.popup.msg" size="sm" :placeholder="$t('button.event.showpopup.message')" class="textarea" />
        {{ data }}
      </b-list-group>
      <div v-else class="modal-client-p text-small">
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
import { AlertToast } from '../../mixins/component'
import { Icons } from '../../mixins/icons'
const selections = namespace('selections')

@Component({ mixins: [Icons, AlertToast] })
export default class BTNEvent extends Vue {
  showToastInfo: any // from mixin AlertToast
  showToastError: any // from mixin AlertToast
  showToastInfoList: any // from mixin AlertToast
  $axios: any
  icon: any
  $t: any
  $mq:any

  isLoading:any = false
  show:boolean = false
  selectionClientsDelete: Array<string> = []

  eventdata: any = { popup: { msg: '' } }

  @selections.Getter public selectionClients!: Array<string>

  @Prop({ default: 'ondemand' }) event!: string
  @Prop({ default: 'border-0 text-left' }) classes!: string
  @Prop({ default: false }) incontextmenu!: boolean
  @Prop({ default: false }) withText!: boolean
  @Prop({ default: undefined }) data?: any
  @Prop({ default: undefined }) isLoadingParent ?: boolean
  @Prop({ default: undefined }) updateLoading ?: Function

  get events () {
    return {
      showpopup: {
        tooltip: 'button.event.showpopup.tooltip',
        titlemodal: 'button.event.showpopup',
        icon: this.icon.message,
        variant: 'outline-primary',

        params: {
          method: 'showPopup',
          params: ['Dummy text']
        }
      },
      ondemand: {
        tooltip: 'button.event.ondemand.tooltip',
        titlemodal: 'button.event.ondemand',
        variant: 'outline-primary',
        icon: this.icon.ondemand,
        params: {
          method: 'fireEvent',
          params: ['on_demand'],
          client_ids: this.selectionClients
        }
      },
      reboot: {
        tooltip: 'button.event.reboot.tooltip',
        titlemodal: 'button.event.reboot',
        icon: this.icon.reboot,
        variant: 'outline-primary',
        params: {
          method: 'reboot',
          params: [],
          client_ids: this.selectionClients
        }
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
    const data = this.callEventPrepareData()

    if (this.updateLoading !== undefined) {
      this.updateLoading(data.params.client_ids)
    }
    await this.$axios.$post('/api/command/opsiclientd_rpc', data.params)
      .then((response) => {
        this.showToastInfoList(response)
        this.callEventSended()
      }).catch((error) => {
        this.showToastError(error) // this.$t('table.fields.reachablility')
        // eslint-disable-next-line no-console
        console.error(error)
        this.callEventSended()
      })
    this.$bvModal.hide('event-modal-' + this.event + '-' + this.data + '-context-menu-' + this.incontextmenu)
  }

  callEventPrepareData () {
    const data = this.events[this.event]
    if (this.event === 'ondemand') { data.params.client_ids = this.selection }
    if (this.event === 'reboot') { data.params.client_ids = [this.data] }
    if (this.event === 'showpopup') {
      data.params.client_ids = this.selection
      data.params.params = [this.eventdata.popup.msg]
    }
    return data
  }

  callEventSended () {
    this.isLoading = false
    if (this.updateLoading !== undefined) { this.updateLoading([]) }
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
