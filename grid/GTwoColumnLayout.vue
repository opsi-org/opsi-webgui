<template>
  <b-row>
    <b-col :class="{'d-none' : showchild && $mq === 'mobile'}">
      <slot name="parent" />
    </b-col>
    <b-col v-if="showchild">
      <slot name="child" />
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class GTwoColumnLayout extends Vue {
  // @Prop({ }) breadcrumb!: string
  @Prop({ }) showchild!: boolean
}
</script>
