<template>
  <div data-testid="TSGroupInitSelection">
    <treeselect
      v-if="groupIds"
      v-model="idselection"
      :multiple="true"
      class="treeselect_groupselect"
      :options="groupIds"
      :placeholder="$t('treeselect.assigntoGroups')"
      :always-open="false"
      @input="$emit('update:id', idselection)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class TSGroupInitSelection extends Vue {
  $axios: any

  groupIds: Array<object> = []
  idselection: any = null

  async fetch () {
    const hostgroups: Array<object> = []
    const result = (await this.$axios.$get('/api/opsidata/hosts/groups/id')).sort()
    for (const c in result) {
      const host = result[c]
      hostgroups.push({ id: host, label: host })
    }
    this.groupIds = hostgroups
  }
}
</script>

<style>
.treeselect_groupselect .vue-treeselect__control {
  background-color: var(--component, var(--background, black));
  color: var(--color, var(--light, white));
  border:1px solid var(--border, #ced4da );
}
.treeselect_groupselect .vue-treeselect__menu {
  background-color: var(--component, var(--background, black));
  color: var(--color, var(--light, white));
}
.treeselect_groupselect .vue-treeselect__single-value {
  color: var(--color, var(--light, white));
}
.treeselect_groupselect .vue-treeselect__input {
  color: var(--color) !important;
}
.treeselect_groupselect .vue-treeselect__menu .vue-treeselect__option--highlight {
  color: var(--color);
  background-color: var(--hover);
}
.treeselect_groupselect.vue-treeselect--single .vue-treeselect__option--selected{
  color: var(--light);
  background-color: var(--primary);
}
</style>
