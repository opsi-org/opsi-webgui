<template>
  <!-- Same as clientsconfig but shows the config in a column (without parent 'clients') -->
  <div>
    <ViewVClientsConfig :id="id" :as-child="asChild" />
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
