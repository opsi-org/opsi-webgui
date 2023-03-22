<template>
  <ViewVHealthCheck :id="id" :as-child="asChild" closeroute="/depots/" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PDepotsHealthCheckAsColumn extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: false }) asChild!: string
}
</script>
