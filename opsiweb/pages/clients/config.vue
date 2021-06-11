<template>
  <!-- Same as clientsconfig but shows the config in a column (without parent 'clients') -->
  <div>
    <ViewVConfig :id="id" :as-child="asChild" closeroute="/clients/" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PClientsConfigColumn extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: false }) asChild!: string
}
</script>

<style>

</style>
