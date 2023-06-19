<template>
  <div data-testid="IFilterTChanges">
    <b-form-input
      id="filterchanges"
      v-model="filter"
      size="sm"
      :aria-label="placeholder"
      type="search"
      :placeholder="placeholder"
      @input="$emit('update:filter', filter)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class IFilterTChanges extends Vue {
  @Prop({ }) placeholder!: string
  filter: string = ''
}
</script>
