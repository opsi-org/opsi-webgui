<template>
  <b-button data-testid="ButtonBTNDeleteAll" size="sm" variant="danger" @click="deleteAll()">
    <b-icon icon="trash" /> Delete All
  </b-button>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
const changes = namespace('changes')
@Component
export default class BTNDeleteAll extends Vue {
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
