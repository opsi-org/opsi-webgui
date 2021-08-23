<template>
  <b-badge v-if="text=='mixed'" variant="bg-orange">
    &#8800;
  </b-badge>
  <b-badge v-else-if="text=='installed'" variant="bg-green">
    <b-icon icon="laptop" alt="installed" title="installed" />
  </b-badge>
  <b-badge v-else-if="text=='unknown'" variant="bg-grey">
    <b-icon icon="question" alt="unknown" />
  </b-badge>
  <b-badge v-else-if="text=='not_installed'||text==''||text=='none'" />
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
