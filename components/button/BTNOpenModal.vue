<template>
  <b-button
    v-b-modal="modalId"
    data-testid="ButtonBTNOpenModal"
    :disabled="disabled"
    :variant="disabled ? 'light' : 'success'"
  >
    <span class="sr-only">{{ disabled ? '' : 'Open product changes overview' }}</span>
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
