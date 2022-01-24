<template>
  <b-button size="sm" variant="outline-primary" @click="clearSelected()">
    Clear Selection
  </b-button>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')
@Component
export default class BTNDeleteAll extends Vue {
  @Prop() store?: string
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void
  @selections.Mutation public setSelectionProducts!: (s: Array<string>) => void

  clearSelected () {
    if (this.store === 'clients') {
      this.setSelectionClients([])
    } else if (this.store === 'products') {
      this.setSelectionProducts([])
    }
  }
}
</script>
