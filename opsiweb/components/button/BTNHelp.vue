<template>
  <b-button :id="id" size="sm" pill variant="transparent" class="border-primary">
    <b-icon-question />
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class BTNHelp extends Vue {
  @Prop({ }) id!: string
}
</script>
