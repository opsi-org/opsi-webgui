<template>
  <ViewVConfig :id="id" :as-child="asChild" closeroute="/clients/" type="clients" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PClientsConfigAsColumn extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: false }) asChild!: string
}
</script>
