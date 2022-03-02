<template>
  <div data-testid="IFilterTChanges">
    <b-form-input
      v-model="filter"
      size="sm"
      type="search"
      placeholder="Filter by Depot ID / Client ID"
      @input="$emit('update:filter', filter)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class IFilterTChanges extends Vue {
  filter: string = ''
}
</script>
