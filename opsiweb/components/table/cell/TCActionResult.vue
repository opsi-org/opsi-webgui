<template>
  <b-badge v-if="text=='mixed'" variant="bg-orange">
    &#8800;
  </b-badge>
  <b-badge v-else-if="text=='successful'" variant="bg-green">
    <b-icon icon="check" alt="successful" />
  </b-badge>
  <b-badge v-else-if="text=='failed'" variant="bg-red">
    <b-icon icon="x" alt="failed" />
  </b-badge>
  <b-badge v-else-if="text=='not_installed'||text==''||text=='none'" variant="transparent">
    {{ ($mq=='mobile')? '-':'' }}
  </b-badge>
  <b-badge v-else>
    {{ text }}
  </b-badge>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class TCSpan extends Vue {
  @Prop({ }) text!: string
}
</script>

<style scoped>
</style>
