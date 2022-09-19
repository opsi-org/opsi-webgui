<template>
  <div data-testid="TTHelp">
    <b-tooltip :target="id">
      <b-table-lite v-if="type === 'table'" id="TTHelpTable" thead-class="table-header-none" borderless :items="tooltipContent" />
    </b-tooltip>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class TTHelp extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) tooltipContent!: any
  @Prop({ }) type!: string
}
</script>
<style>
#TTHelpTable {
  max-width: 500px !important;
}
</style>
