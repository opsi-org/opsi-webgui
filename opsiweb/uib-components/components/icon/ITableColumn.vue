<template>
  <b-icon data-testid="ITableColumn" :icon="icon.columns" />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class ITableColumn extends Vue {
  icon:any
}
</script>
