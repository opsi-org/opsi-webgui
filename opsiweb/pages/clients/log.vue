<template>
  <ViewVClientsLog :id="id" :as-child="asChild" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PClientLogColumn extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: false }) asChild!: string
}
</script>
