<template>
  <el-tabs lazy>
    <el-tab-pane v-for="category in groupActions" :key="category.category" :label="$t('title.' + category.category)">
      <TreeTGroupActions :data="category" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
const groupActions = reactive([
  {
    category: 'client-group',
    actions: {
      maingroups: ['group-add'],
      parent: ['edit', 'delete', 'client-delete', 'client-add', 'group-add'],
      children: ['delete', 'copy']
    }
  },
  // TODO: Add 'group-add' and 'edit' to the list prodGroups.actions.parent
  {
    category: 'product-group',
    actions: {
      parent: ['delete', 'product-delete', 'product-add'],
      children: ['delete']
    }
  }
])
</script>
