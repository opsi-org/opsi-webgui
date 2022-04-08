<template>
  <div data-testid="ITableColumn">
    <b-icon :icon="iconnames.columns" />
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
