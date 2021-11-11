<template>
  <b-button size="sm" variant="outline-primary" @click="clearSelected()">
    <b-icon icon="trash" /> Clear Selected Clients
  </b-button>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')
@Component
export default class BTNDeleteAll extends Vue {
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

  clearSelected () {
    this.setSelectionClients([])
  }
}
</script>
