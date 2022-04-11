<template>
  <b-button data-testid="ButtonBTNDeleteObj" size="sm" class="border-0" variant="outline-primary" :title="$t('button.delete')" @click="deleteChanges()">
    <span class="sr-only">{{ $t('button.delete') }}</span>
    <b-icon :icon="iconnames.delete" />
  </b-button>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
const changes = namespace('changes')

@Component({ mixins: [Constants] })
export default class BTNDeleteObj extends Vue {
  iconnames: any
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
