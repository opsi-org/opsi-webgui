
<template>
  <Story :layout="{ type: 'grid' }">
    <Variant v-for="v,k in items" :title="'' + k">
      <IconIConfigState :item="v"/>
    </Variant>
  </Story>
</template>

<script lang="ts" setup>
const items = {
  'isConfig-bool': {
    configId: 'isConfig-bool',
    description: 'isConfig-bool',
    type: 'BoolConfig',
    possibleValues: [true, false],
    value: true,
    editable: true,
    multiValue: false,
    anyObjDiff: false,
  },
  'isConfig-unicode': {
    configId: 'isConfig-unicode',
    description: 'isConfig-unicode',
    type: 'UnicodeConfig',
    possibleValues: ['a', 'b', 'c'],
    value: 'a',
    editable: true,
    multiValue: false,
    anyObjDiff: false,
  },

  'isState-bool-equal': {
    configId: 'isState-bool-equal',
    description: 'isState-bool-equal',
    type: 'BoolConfig',
    possibleValues: [true, false],
    // value: true,
    defaultValues: true,
    objects: {
      '1': true,
      '2': true,
      '3': true,
    },
    anyObjDiff: false,
    editable: false,
    multiValue: false,
  },
  'isState-bool-unequal': {
    configId: 'isState-bool-unequal',
    description: 'isState-bool-unequal',
    type: 'BoolConfig',
    possibleValues: [true, false],
    // value: true,
    defaultValues: false,
    anyObjDiff: true,
    objects: {
      '1': true,
      '2': true,
      '3': true,
    },
    editable: false,
    multiValue: false,
  },
}
</script>
