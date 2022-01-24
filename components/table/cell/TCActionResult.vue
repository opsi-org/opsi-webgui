<template>
  <b-badge v-if="text=='mixed'" variant="warning">
    &#8800;
  </b-badge>
  <b-badge v-else-if="text=='successful'" variant="success">
    <b-icon icon="check" alt="successful" />
  </b-badge>
  <b-badge v-else-if="text=='failed'" variant="danger">
    <b-icon icon="x" alt="failed" />
  </b-badge>
  <b-badge v-else-if="$mq=='mobile'&&(text=='not_installed'||text==''||text=='none')" variant="transparent">
    {{ ($mq=='mobile')? '-':'' }}
  </b-badge>
  <b-badge v-else-if="$mq!='mobile'&&(text=='not_installed'||text==''||text=='none')" variant="transparent" />
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
