<template>
  <b-button
    :id="id"
    data-testid="ButtonBTNHelp"
    size="sm"
    type="help"
    class="border-0"
    variant="outline-primary"
  >
    <b-icon :icon="icon.help" />
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class BTNHelp extends Vue {
  icon: any
  @Prop({ }) id!: string
}
</script>
