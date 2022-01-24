<template>
  <b-badge v-if="text=='mixed'" variant="warning">
    &#8800;
  </b-badge>
  <b-badge v-else-if="text=='installed'" variant="success">
    <b-icon icon="laptop" alt="installed" title="installed" />
  </b-badge>
  <b-badge v-else-if="text=='unknown'" variant="warning" text-variant="dark">
    <b-icon icon="question" alt="unknown" />
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
