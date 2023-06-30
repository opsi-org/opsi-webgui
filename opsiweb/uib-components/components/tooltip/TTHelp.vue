<template>
  <div data-testid="TTHelp">
    <b-tooltip :target="id">
      <template v-if="type === 'grid'">
        <span v-for="item, index in tooltipContent" :key="index">
          <GridGFormItem :label="item.label" :value="item.description" />
        </span>
      </template>
      <template v-else>
        {{ tooltipContent }}
        <slot name="tooltipContentHTML" />
      </template>
    </b-tooltip>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class TTHelp extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) tooltipContent!: any
  @Prop({ }) type!: string
}
</script>
