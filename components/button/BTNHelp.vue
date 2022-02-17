<template>
  <b-button
    :id="id"
    data-testid="ButtonBTNHelp"
    size="sm"
    variant="transparent"
  >
    <b-icon-question-circle />
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class BTNHelp extends Vue {
  @Prop({ }) id!: string
}
</script>
