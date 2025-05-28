<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div>
    <el-container
      :class="{
        mycontainer: true,
        [classcontainer]: true,
      }"
    >
      <el-main
        v-if="page0Condition"
        class="mycol"
        :class="{
          [props.classfirstcol]: !isMobile,
          [props.classeachcol]: true,
          [props.classmaincol]: $props.classmaincol,
        }"
      >
        <slot />
      </el-main>
      <el-aside
        v-if="page1Condition"
        :width="width"
        class="mycol"
        :class="{
          [props.classeachcol]: true,
          [props.classlastcol]: !isMobile && !page2Condition,
        }"
      >
        <slot name="page1" />
      </el-aside>
      <el-aside
        v-if="page2Condition"
        :width="width"
        class="mycol"
        :class="{
          [props.classlastcol]: !isMobile,
          [props.classeachcol]: true,
        }"
      >
        <slot name="page2" />
      </el-aside>
    </el-container>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps({
    isMobile: {
      type: Boolean,
      default: () => {
        return useMQ().isMobile.value
      },
    },
    page0Condition: { type: Boolean, default: true },
    page1Condition: { type: Boolean, default: false },
    page2Condition: { type: Boolean, default: false },
    width: { type: String, default: '0%' },
    classeachcol: { type: String, default: '' },
    classfirstcol: { type: String, default: '' },
    classlastcol: { type: String, default: '' },
    classcontainer: { type: String, default: 'pagecontent' },
    classmaincol: { type: String, default: '' },
  })
  onMounted(() => {})
  const width = computed(() => {
    if (props.isMobile) {
      return '100%' // for mobile we overlap pages
    }
    return props.width
  })
  const page0Condition = computed(() => {
    if (props.isMobile && (page1Condition.value || page2Condition.value)) return false
    return props.page0Condition
  })
  const page1Condition = computed(() => {
    if (props.isMobile && page2Condition.value) return false
    return props.page1Condition
  })
  const page2Condition = computed(() => {
    return props.page2Condition
  })
</script>

<style scoped>
  .pagecontent {
    max-height: calc(100vh - 90px) !important;
    max-width: calc(100vw - 90px) !important;
    max-width: 100% !important;
  }
  .is-mobile .pagecontent,
  .is-mobile .pagecontent .mycol {
    --above-main: 120px;
    height: calc(100vh - var(--above-main)) !important;
    max-height: calc(100vh - var(--above-main)) !important;
  }
  .el-main {
    padding: 0px !important;
    --above-main: 120px;
    --el-main-padding: 10px;
    height: calc(100vh - var(--above-main)) !important;
    max-height: calc(100vh - var(--above-main)) !important;
  }

  .mycontainer .mycol:not(:last-child) {
    margin-right: 1rem !important;
  }

  main.el-main.col-main-visible-false {
    max-width: min-content;
  }
</style>
