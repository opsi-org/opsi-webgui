<template>
  <div data-testid="ITableColumn" class="ITableColumn">
    <b-icon :icon="iconnames.columns" class="ITableColumn-icon" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

@Component({ mixins: [Constants] })
export default class ITableColumn extends Vue {
  iconnames:any // mixin/plugin
}
</script>
<style>
.ITableColumn-icon {
  color: var(--dark) !important;
}
.ITableColumn-icon:hover {
  color: var(--light) !important;
}
</style>
