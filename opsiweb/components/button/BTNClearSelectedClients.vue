<template>
  <b-button size="sm" variant="outline-primary" @click="clearSelected()">
    <b-icon icon="trash" /> Clear Selected Clients
  </b-button>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const changes = namespace('changes')
@Component
export default class BTNDeleteAll extends Vue {
  @changes.Getter public changesProducts!: Array<object>
  @changes.Mutation public deleteAllChanges!: () => void

  // clearSelected () {
  //   this.deleteAllChanges()
  //   this.$nuxt.refresh()
  // }
}
</script>
