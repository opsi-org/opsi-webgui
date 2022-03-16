<template>
  <div data-testid="IFilterTChanges">
    <label for="filterchanges" class="sr-only"> Filter by Depot ID / Client ID </label>
    <b-form-input
      id="filterchanges"
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
