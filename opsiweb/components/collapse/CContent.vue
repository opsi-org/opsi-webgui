<template>
  <div>
    <BarBPageHeader
      navbartype="collapse"
      :bold="bold"
      :collapsed="visible"
      :aria-controls="(id || title)+'-collapse'"
      :aria-expanded="visible"
      :title="title"
      @click.native="visible = !visible"
    >
      <template v-if="$slots.left" #left>
        <slot name="left" />
      </template>
    </BarBPageHeader>
    <b-collapse :id="(id || title)+'-collapse'" v-model="visible" accordion="content-accordion">
      <slot name="content" />
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class CContent extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) title!: string
  @Prop({ default: true }) bold!: boolean
  @Prop({ default: false }) visible!: boolean
  // visible: boolean = false
}
</script>
