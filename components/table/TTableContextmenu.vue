<template>
  <b-table
    data-testid="TTableContextmenu"
    v-bind="$props"
  >
    <template
      v-for="slotName in Object.keys($scopedSlots)"
      #[slotName]="slotScope"
    >
      <{{slotName}}>
      <ContextmenuCMViewTable v-if="slotName.includes('cell')" :item="slotScope.item[primaryKey]" :context-clienttable="id=='Clients'">
        <template #item>
          <slot :name="slotName" v-bind="slotScope" />
        </template>
      </ContextmenuCMViewTable>
      <slot v-else :name="slotName" v-bind="slotScope" />
    </template>
    <template v-for="el in slotScope">
      el {{el}}
    </template>
  </b-table>
</template>

<script lang="ts">
import { Component } from 'nuxt-property-decorator'
import { BTable } from 'bootstrap-vue'

@Component
export default class TTableContextmenu extends BTable {
}
</script>
<style scoped>
</style>
