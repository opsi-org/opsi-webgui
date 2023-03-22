<template>
  <ViewVAdminTerminal :id="id" :as-child="asChild" closeroute="/admin/" type="admin" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PAdminTermin extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: false }) asChild!: string
}
</script>
