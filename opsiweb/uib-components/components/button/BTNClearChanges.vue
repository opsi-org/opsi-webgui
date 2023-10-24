<template>
  <b-button data-testid="BTNClearChanges" variant="primary" :title="$t('button.resetAll')" size="sm" @click="deleteAll()">
    <IconIIcon :icon="icon.reset" />
    <span class="resetall">{{ $t('button.resetAll') }}</span>
  </b-button>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
const changes = namespace('changes')

@Component({ mixins: [Icons] })
export default class BTNClearChanges extends Vue {
  $nuxt: any
  icon: any
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
