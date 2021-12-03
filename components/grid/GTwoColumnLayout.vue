<template>
  <b-row data-testid="GTwoColumnLayout">
    <b-col :class="{'d-none' : showchild && $mq === 'mobile', column2visible: showchild}">
      <slot name="parent" />
    </b-col>
    <b-col v-if="showchild" :class="{column2visible: Boolean(showchild)}">
      <slot name="child" />
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
const settings = namespace('settings')

@Component
export default class GTwoColumnLayout extends Vue {
  @Prop({ default: 'default' }) parentId!: string
  @Prop({ }) showchild!: string

  @settings.Getter public twoColumnLayoutCollapsed!: Array<string>
  @settings.Mutation public setColumnLayoutCollapsed!: (obj: object) => void

  @Watch('showchild') layoutColumnChanged () {
    this.setColumnLayoutCollapsed({ parentId: this.parentId, value: Boolean(this.showchild) })
  }

  mounted () {
    this.layoutColumnChanged()
  }
}
</script>
