<template>
  <div data-testid="MTrackChanges" class="MTrackChanges">
    <b-button
      v-if="!quicksave && (changesProducts.filter((o) => o.user === username).length!==0 || changesHostParam.filter((o) => o.user === username).length!==0)"
      class="mt-2"
      variant="primary"
      @click="$bvModal.show('trackChangesModal')"
    >
      <b-icon
        v-b-tooltip.hover
        :title="$t('button.track.changes')"
        :icon="iconnames.trackchanges"
      />
      <span v-if="$mq!='mobile'" class="btnlabel"> {{ $t('button.track.changes') }} </span>
    </b-button>
    <b-modal
      id="trackChangesModal"
      data-testid="MTrackChangesModal"
      size="xl"
      :title="$t('button.track.changes')"
      hide-footer
      no-fade
      @hide="$nuxt.refresh()"
    >
      <b-tabs lazy>
        <b-tab v-if="changesHostParam.filter((o) => o.user === username).length!==0" :title="$t('Host Parameters')" active>
          <GridGChangesHostParam />
        </b-tab>
        <b-tab v-if="changesProducts.filter(o => o.user === username).length !== 0" :title="$t('Product Actions and Properties')">
          <GridGChangesProducts />
        </b-tab>
      </b-tabs>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, namespace } from 'nuxt-property-decorator'
import { ChangeObj } from '../../.utils/types/tchanges'
import { Constants } from '../../mixins/uib-mixins'
const auth = namespace('auth')
const settings = namespace('settings')
const changes = namespace('changes')

@Component({ mixins: [Constants] })
export default class MTrackChanges extends Vue {
  iconnames: any
  $nuxt: any
  $axios: any
  $t:any
  $mq:any
  changelist: Array<ChangeObj> = []
  error: string = ''

  @Prop() child!: boolean
  @Prop() closeroute!: string
  @auth.Getter public username!: string
  @settings.Getter public quicksave!: boolean
  @changes.Getter public changesProducts!: Array<ChangeObj>
  @changes.Getter public changesHostParam!: Array<ChangeObj>
}
</script>

<style>
.MTrackChanges .modal-header .close {
  color: var(--color, var(--primary, black));
}
.MTrackChanges .modal-dialog {
  left: 0% !important;
  top:10% !important;
}
</style>
