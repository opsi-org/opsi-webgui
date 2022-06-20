<template>
  <div data-testid="TDefaultLite">
    <b-table-lite
      v-bind="$props"
      borderless
      responsive="md"
      :items="items"
    >
      <template
        v-for="slotName in Object.keys($scopedSlots)"
        #[slotName]="slotScope"
      >
        <slot :name="slotName" v-bind="slotScope" />
      </template>
    </b-table-lite>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class TDefaultLite extends Vue {
  @Prop({ }) items!: Array<object>
}
</script>

<style>
</style>
