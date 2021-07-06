<template>
  <div>
    <BarBPageHeader
      navbartype="collapse"
      :collapsed="visible"
      :aria-controls="title+'-collapse'"
      :aria-expanded="visible"
      :title="title"
      @click.native="visible = !visible"
    />
    <b-collapse :id="title+'-collapse'" v-model="visible" accordion="content-accordion">
      <slot name="content" />
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class CContent extends Vue {
  @Prop({ }) title!: string
  visible: boolean = false
}
</script>
