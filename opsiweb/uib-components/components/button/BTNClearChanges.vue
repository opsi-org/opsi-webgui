<template>
  <b-button data-testid="BTNClearChanges" variant="primary" :title="$t('button.resetAll')" @click="deleteAll()">
    <b-icon :icon="iconnames.reset" />
    <span class="resetall">{{ $t('button.resetAll') }}</span>
  </b-button>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
const changes = namespace('changes')

@Component({ mixins: [Constants] })
export default class BTNClearChanges extends Vue {
  $nuxt: any
  iconnames: any
  @Prop({ }) from!: string

  @changes.Mutation public deleteAllProductChanges!: () => void
  @changes.Mutation public deleteAllChangesHostParam!: () => void

  deleteAll () {
    if (this.from === 'products') {
      this.deleteAllProductChanges()
    }
    if (this.from === 'hostparam') {
      this.deleteAllChangesHostParam()
    }
  }
}
</script>
