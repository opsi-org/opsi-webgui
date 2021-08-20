<template>
  <div>
    <b-badge v-if="text=='mixed'" variant="warning">
      &#8800;
    </b-badge>
    <b-badge v-else-if="text=='installed'" variant="success">
      <b-icon icon="laptop" alt="installed" />
    </b-badge>
    <b-badge v-else-if="text=='unknown'" variant="grey">
      <b-icon icon="question" alt="unknown" />
    </b-badge>
    <b-badge v-else-if="text=='not_installed'||text==''|| text=='none'" variant="transparent">
      <b-icon icon="" alt="not installed" />
    </b-badge>
    <b-badge v-else>
      {{ text }}
    </b-badge>
  </div>
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
