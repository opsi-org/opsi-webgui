<template>
  <b-button
    :id="id"
    data-testid="ButtonBTNHelp"
    size="sm"
    class="border-0"
    variant="outline-primary"
  >
    <b-icon :icon="iconnames.help" />
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class BTNHelp extends Vue {
  iconnames: any
  @Prop({ }) id!: string
}
</script>
