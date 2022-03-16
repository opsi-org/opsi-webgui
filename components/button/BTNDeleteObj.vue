<template>
  <b-button data-testid="ButtonBTNDeleteObj" size="sm" variant="light" @click="deleteChanges()">
    <span class="sr-only">Delete</span>
    <b-icon icon="trash" />
  </b-button>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
const changes = namespace('changes')
@Component
export default class BTNDeleteObj extends Vue {
  @Prop({ }) item!: object
  // @Prop({ }) hide!: string
  @Prop({ }) from!: string

  // @changes.Getter public changesProducts!: Array<object>
  @changes.Mutation public delFromChangesProducts!: (s: object) => void

  deleteChanges () {
    if (this.from === 'products') {
      this.delFromChangesProducts(this.item)
    }
    // if (this.changesProducts.length === 0) {
    //   this.$bvModal.hide(this.hide)
    //   this.$nuxt.refresh()
    // }
  }
}
</script>
