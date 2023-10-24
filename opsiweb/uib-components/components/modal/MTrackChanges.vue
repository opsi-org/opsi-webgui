<template>
  <div data-testid="MTrackChanges" class="MTrackChanges">
    <b-button
      v-if="!quicksave && (changesProducts.filter((o) => o.user === username).length!==0 || changesHostParam.filter((o) => o.user === username).length!==0)"
      :title="$t('button.track.changes')"
      variant="primary border-0"
      size="sm"
      @click="$bvModal.show('trackChangesModal')"
    >
      <IconIIcon :icon="icon.trackChanges" />
      <div class="btnlabel" />
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
      <b-tabs small lazy>
        <b-tab :title="$t('title.hostparameters')" active>
          <GridGChangesHostParam v-if="changesHostParam.filter((o) => o.user === username).length!==0" />
          <span v-else>{{ $t("empty") }}</span>
        </b-tab>
        <b-tab :title="$t('title.prodactionsprops')">
          <GridGChangesProducts v-if="changesProducts.filter(o => o.user === username).length !== 0" />
          <span v-else>{{ $t("empty") }}</span>
        </b-tab>
      </b-tabs>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, namespace } from 'nuxt-property-decorator'
import { ChangeObj } from '../../.utils/types/tchanges'
import { Icons } from '../../mixins/icons'
const auth = namespace('auth')
const settings = namespace('settings')
const changes = namespace('changes')

@Component({ mixins: [Icons] })
export default class MTrackChanges extends Vue {
  icon: any
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
