<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div>
    <el-text tag="b" class="text-capitalize after:content-['-']">
      {{ $t('title.properties') }}
    </el-text>
    <el-text tag="i"> {{ route.params.id }} </el-text>
    <el-button class="float-right" @click="router.push(`/products/${route.params.producttype}`)"
      ><IconIIcon :icon="icons.x"
    /></el-button>
    <ViewVConfigProduct type="product" :id="route.params.id as string" :is-child="true" />
  </div>
</template>
<script setup lang="ts">
  const $t = useI18n().t
  const route = useRoute()
  const router = useRouter()
  const icons = useIcons()
</script>
