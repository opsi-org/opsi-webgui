<template>
  <ViewVClientClone :id="id" :as-child="asChild" closeroute="/clients/" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PClientsCloneAsColumn extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: false }) asChild!: string
}
</script>
