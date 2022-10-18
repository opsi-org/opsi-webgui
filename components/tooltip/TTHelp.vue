<template>
  <div data-testid="TTHelp">
    <b-tooltip :target="id">
      <template v-if="type === 'grid'">
        <span v-for="item, index in tooltipContent" :key="index">
          <GridGFormItem classgrid="text-sm-left">
            <template #label>
              {{ item.label }}
            </template>
            <template #value>
              {{ item.description }}
            </template>
          </GridGFormItem>
        </span>
      </template>
      <template v-else>
        {{ tooltipContent }}
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
<style>
#TTHelpTable {
  max-width: 500px !important;
}
</style>
