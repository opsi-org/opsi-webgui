<template>
  <div data-testid="IFilterTChanges">
    <b-form-input
      id="filterchanges"
      v-model="filter"
      class="filterchanges"
      :aria-label="$t('table.filterBy.DepotsClients')"
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
