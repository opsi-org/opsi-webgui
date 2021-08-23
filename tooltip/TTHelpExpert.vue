<template>
  <b-tooltip :target="target" variant="light">
    <b> User Mode </b>
    <b-row class="text-left">
      <b-col>
        Normal Mode:
      </b-col>
      <b-col>
        Product actionRequest changes can be saved immediately
      </b-col>
    </b-row>
    <b-row class="text-left">
      <b-col>
        Expert Mode:
      </b-col>
      <b-col>
        There is a Overview of changes with Delete/Save features.
      </b-col>
    </b-row>
  </b-tooltip>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class TTHelpExpert extends Vue {
   @Prop({ }) target!: string
}
</script>
<style>
</style>
