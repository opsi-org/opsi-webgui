<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-tabs v-model="activeName" lazy>
    <el-tab-pane :label="$t('form.general')" name="general">
      <FormFAdminGeneral v-if="activeName == 'general'" />
    </el-tab-pane>
    <el-tab-pane :label="$t('label.maintenance')" name="maintenance">
      <FormFAdminMaintenance v-if="activeName == 'maintenance'" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
  const $t = useI18n().t

  const props = defineProps({
    type: { type: String, default: 'general' },
  })
  const activeName = ref(props.type)
  watch(
    () => activeName.value,
    () => {
      useRouter().push({ path: `/admin/${activeName.value}` })
    }
  )
</script>
