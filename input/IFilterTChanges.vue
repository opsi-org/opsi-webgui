<template>
  <b-form-input
    v-model="filter"
    size="sm"
    type="search"
    placeholder="Filter by DepotID / Client ID"
    @input="$emit('update:filter', filter)"
  />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class IFilterTChanges extends Vue {
  filter: string = ''
}
</script>
