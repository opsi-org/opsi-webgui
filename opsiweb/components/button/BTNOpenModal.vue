<template>
  <b-button
    v-b-modal="modalId"
    :disabled="disabled"
    :variant="disabled ? 'light' : 'success'"
  >
    <b-icon :icon="icon" :variant="disabled ? 'dark' : 'light'" />
  </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class BTNOpenModal extends Vue {
  @Prop({ }) modalId!: string
  @Prop({ }) disabled!: boolean
  @Prop({ }) icon!: string
}
</script>
