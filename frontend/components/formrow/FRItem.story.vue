<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<script setup lang="ts">
  const items = {
    'bool-false': {
      configId: 'license-management.use',
      description: 'Activate license management',
      type: 'BoolConfig',
      value: false,
      possibleValues: [false, true],
      multiValue: false,
      editable: false,
    },
    'bool-true': {
      configId: 'license-management.use',
      description: 'Activate license management',
      type: 'BoolConfig',
      value: true,
      possibleValues: [false, true],
      multiValue: false,
      editable: false,
    },

    'unicode-empty': {
      configId: 'some-entry',
      description: 'Activate license management',
      type: 'UnicodeConfig',
      value: '',
      possibleValues: [],
      multiValue: false,
      editable: true,
    },

    'unicode-single-edit': {
      configId: 'licensing.client_limit_warning_absolute',
      description: 'Warn when the number of available licenses reaches this value.',
      type: 'UnicodeConfig',
      value: '5',
      possibleValues: ['5', '6', '7'],
      multiValue: false,
      editable: true,
      newValue: '',
      newValues: [],
    },

    'unicode-single-noedit': {
      configId: 'clientconfig.depot.drive',
      description: 'Drive letter for depot share',
      type: 'UnicodeConfig',
      value: 'p:',
      possibleValues: [
        'a:',
        'b:',
        'c:',
        'd:',
        'dynamic',
        'e:',
        'f:',
        'g:',
        'h:',
        'i:',
        'j:',
        'k:',
        'l:',
        'm:',
        'n:',
        'o:',
        'p:',
        'q:',
        'r:',
        's:',
        't:',
        'u:',
        'v:',
        'w:',
        'x:',
        'y:',
        'z:',
      ],
      multiValue: false,
      editable: false,
    },

    'unicode-multi-edit': {
      configId: 'configed.domains_given',
      description: 'saved domains for creating clients',
      type: 'UnicodeConfig',
      value: ['0:acme.corp', '1:uib.local'],
      possibleValues: ['0:acme.corp', '1:uib.local'],
      multiValue: true,
      editable: true,
      newValue: '',
      newValues: [],
    },

    'unicode-multi-noedit': {
      configId: 'configed.host_displayfields',
      description: '',
      type: 'UnicodeConfig',
      value: [
        'clientConnected',
        'clientDescription',
        'clientIPAddress',
        'clientLastSeen',
        'clientName',
      ],
      possibleValues: [
        'UEFIboot',
        'WANmode',
        'clientConnected',
        'clientCreated',
        'clientDescription',
        'clientHardwareAddress',
        'clientIPAddress',
        'clientInventoryNumber',
        'clientLastSeen',
        'clientName',
        'clientSessionInfo',
        'clientSystemUUID',
        'depotId',
        'installByShutdown',
      ],
      multiValue: true,
      editable: false,
    },
  }

  const pushUnique = (arr: Array<any>, val: any) => {
    if (!arr.includes(val)) {
      arr.push(val)
    }
  }
  const changeValue = (item: any, v: any) => {
    item.value = v
    pushUnique(item.possibleValues, v)
  }
</script>
<template>
  <Story :layout="{ type: 'grid', width: '50%' }">
    <!-- <Variant title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled :meta="{ wrapperMobile: true }" responsive-disabled>
    </Variant> -->
    <Variant title="Config-Server-bool-false" :meta="{ wrapperMobile: true }" responsive-disabled>
      <FormrowFRItem
        :item="items['bool-false']"
        @change="
          (v: any) => {
            changeValue(items['bool-false'], v)
          }
        "
      />
    </Variant>
    <Variant title="Config-Server-bool-true" :meta="{ wrapperMobile: true }" responsive-disabled>
      <FormrowFRItem
        :item="items['bool-true']"
        @change="
          (v: any) => {
            changeValue(items['bool-false'], v)
          }
        "
      />
    </Variant>

    <Variant
      title="Config-Server-unicode-single-edit"
      :meta="{ wrapperMobile: true }"
      responsive-disabled
    >
      <FormrowFRItem
        :item="items['unicode-single-edit']"
        @change="
          (v: any) => {
            changeValue(items['unicode-single-edit'], v)
          }
        "
      />
    </Variant>
    <Variant
      title="Config-Server-unicode-single-noedit"
      :meta="{ wrapperMobile: true }"
      responsive-disabled
    >
      <FormrowFRItem
        :item="items['unicode-single-noedit']"
        @change="
          (v: any) => {
            changeValue(items['unicode-single-noedit'], v)
          }
        "
      />
    </Variant>

    <Variant
      title="Config-Server-unicode-multi-edit"
      :meta="{ wrapperMobile: true }"
      responsive-disabled
    >
      <FormrowFRItem
        :item="items['unicode-multi-edit']"
        @change="
          (v: any) => {
            changeValue(items['unicode-multi-edit'], v)
          }
        "
      />
    </Variant>
    <Variant
      title="Config-Server-unicode-multi-noedit"
      :meta="{ wrapperMobile: true }"
      responsive-disabled
    >
      <FormrowFRItem
        :item="items['unicode-multi-noedit']"
        @change="
          (v: any) => {
            changeValue(items['unicode-multi-noedit'], v)
          }
        "
      />
    </Variant>

    <Variant
      title="Config-Server-unicode-empty-single-edit"
      :meta="{ wrapperMobile: true }"
      responsive-disabled
    >
      <FormrowFRItem
        :item="items['unicode-empty']"
        @change="
          (v: any) => {
            changeValue(items['unicode-empty'], v)
          }
        "
      />
    </Variant>
    <Variant
      title="Config-Server-unicode-empty-single-edit"
      :meta="{ wrapperMobile: true }"
      responsive-disabled
    >
      <el-form label-width="50%">
        <FormrowFRItem
          :item="items['bool-true']"
          @change="
            (v: any) => {
              changeValue(items['bool-true'], v)
            }
          "
        />
        <FormrowFRItem
          :item="items['unicode-empty']"
          @change="
            (v: any) => {
              changeValue(items['unicode-empty'], v)
            }
          "
        />
        <FormrowFRItem
          :item="items['unicode-multi-noedit']"
          @change="
            (v: any) => {
              changeValue(items['unicode-multi-noedit'], v)
            }
          "
        />
      </el-form>
    </Variant>
  </Story>
</template>
