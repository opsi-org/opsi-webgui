<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <Story :layout="{ type: 'grid', width: '50%' }">
    <!-- <Story> -->
    <Variant
      v-for="(v, k) in items"
      :key="k"
      :title="'' + k"
      :meta="{ wrapperMobile: true }"
      responsive-disabled
    >
      <IconIConfigState :item="v" />
    </Variant>
  </Story>
</template>

<script lang="ts" setup>
  const items = {
    'isConfig-bool-always-equal': {
      configId: 'isConfig-bool',
      description: 'isConfig-bool',
      type: 'BoolConfig',
      possibleValues: [true, false],
      value: true,
      editable: true,
      multiValue: false,
      anyObjDiff: false, // this value is only for debugging purposes. will not be given by the server
    },
    'isConfig-unicode-always-equal': {
      configId: 'isConfig-unicode',
      description: 'isConfig-unicode',
      type: 'UnicodeConfig',
      possibleValues: ['a', 'b', 'c'],
      value: 'a',
      editable: true,
      multiValue: false,
      anyObjDiff: false, // this value is only for debugging purposes. will not be given by the server
    },

    'isState-bool-equal': {
      configId: 'isState-bool-equal',
      description: 'isState-bool-equal',
      type: 'BoolConfig',
      possibleValues: [true, false],
      // value: true,
      defaultValues: [true],
      objects: {
        '1': true,
        '2': true,
        '3': true,
      },
      anyObjDiff: false, // this value is only for debugging purposes. will not be given by the server
      editable: false,
      multiValue: false,
    },
    'isState-bool-unequal': {
      configId: 'isState-bool-unequal',
      description: 'isState-bool-unequal',
      type: 'BoolConfig',
      possibleValues: [true, false],
      // value: true,
      defaultValues: [false],
      anyObjDiff: true, // this value is only for debugging purposes. will not be given by the server
      objects: {
        '1': true,
        '2': true,
        '3': true,
      },
      editable: false,
      multiValue: false,
    },

    'isState-unicode-equal': {
      configId: 'isState-unicode-equal',
      description: 'isState-unicode-equal',
      type: 'UnicodeConfig',
      possibleValues: ['a', 'b', 'c'],
      // value: 'a',
      defaultValues: ['a'],
      anyObjDiff: false, // this value is only for debugging purposes. will not be given by the server
      objects: {
        '1': ['a'],
        '2': ['a'],
        '3': ['a'],
      },
      editable: false,
      multiValue: false,
    },
    'isState-unicode-unequal': {
      configId: 'isState-unicode-unequal',
      description: 'isState-unicode-unequal',
      type: 'UnicodeConfig',
      possibleValues: ['a', 'b', 'c'],
      // value: 'a',
      defaultValues: ['b'],
      anyObjDiff: true, // this value is only for debugging purposes. will not be given by the server
      objects: {
        '1': ['a'],
        '2': ['a'],
        '3': ['a'],
      },
      editable: false,
      multiValue: false,
    },

    'isConfig-mixed-unicode-unequal': {
      configId: 'isConfig-mixed-unicode',
      description: 'isConfig-mixed-unicode',
      type: 'UnicodeConfig',
      possibleValues: ['a', 'b', 'c'],
      defaultValues: ['a'],
      editable: true,
      multiValue: true,
      anyObjDiff: true, // this value is only for debugging purposes. will not be given by the server
      objects: {
        '1': ['a'],
        '2': ['b'],
        '3': ['a'],
      },
    },
  }
</script>
