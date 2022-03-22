<template>
  <b-button data-testid="BTNClearChanges" size="sm" variant="danger" :title="$t('button.deleteall')" @click="deleteAll()">
    <b-icon :icon="iconnames.delete" />
    {{ $t('button.deleteall') }}
  </b-button>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
const changes = namespace('changes')

@Component({ mixins: [Constants] })
export default class BTNClearChanges extends Vue {
  // $nuxt: any
  iconnames: any
  // @Prop({ }) hide!: string

  @changes.Getter public changesProducts!: Array<object>
  @changes.Mutation public deleteAllChanges!: () => void

  deleteAll () {
    this.deleteAllChanges()
    // if (this.hide) { this.$bvModal.hide(this.hide) }
    // this.$nuxt.refresh()
  }
}
</script>
