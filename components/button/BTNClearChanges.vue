<template>
  <b-button data-testid="BTNClearChanges" variant="primary" :title="$t('button.resetAll')" @click="deleteAll()">
    <b-icon :icon="iconnames.reset" />
    <span class="resetall">{{ $t('button.resetAll') }}</span>
  </b-button>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import * as mixin from '../../mixins/uib-mixins'
const changes = namespace('changes')

@Component({ mixins: [mixin.Constants] })
export default class BTNClearChanges extends Vue {
  $nuxt: any
  iconnames: any
  @Prop({ }) hide!: string

  @changes.Getter public changesProducts!: Array<object>
  @changes.Mutation public deleteAllChanges!: () => void

  deleteAll () {
    this.deleteAllChanges()
    if (this.hide) { this.$bvModal.hide(this.hide) }
    this.$nuxt.refresh()
  }
}
</script>
