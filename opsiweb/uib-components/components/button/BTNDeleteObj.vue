<template>
  <b-button
    data-testid="ButtonBTNDeleteObj"
    class="border-0"
    size="sm"
    variant="outline-primary"
    :title="$t('button.reset')"
    @click="deleteChanges()"
  >
    <span class="sr-only">{{ $t('button.reset') }}</span>
    <IconIIcon :icon="icon.reset" />
  </b-button>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
const changes = namespace('changes')

@Component({ mixins: [Icons] })
export default class BTNDeleteObj extends Vue {
  icon: any
  @Prop({ }) item!: object
  @Prop({ }) from!: string

  @changes.Mutation public delFromChangesProducts!: (s: object) => void
  @changes.Mutation public delFromChangesHostParam!: (s: object) => void

  deleteChanges () {
    if (this.from === 'products') {
      this.delFromChangesProducts(this.item)
    }
    if (this.from === 'hostparam') {
      this.delFromChangesHostParam(this.item)
    }
  }
}
</script>
