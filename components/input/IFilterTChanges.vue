<template>
  <div data-testid="IFilterTChanges">
    <label for="filterchanges" class="sr-only"> {{ $t('table.filterBy.DepotsClients') }}</label>
    <b-form-input
      id="filterchanges"
      v-model="filter"
      size="sm"
      type="search"
      :placeholder="$t('table.filterBy.DepotsClients')"
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
