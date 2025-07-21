<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <el-form
    label-width="30%"
    :label-position="mq.isMobile.value ? 'top' : 'left'"
    class="diagnostics-form"
    v-if="Object.keys(data).length > 0"
    :key="rerenderKey"
  >
    <div v-for="(values, category) in dataCopy" :key="category">
      <template v-if="values && Object.keys(values).length !== 0">
        <h3 class="mt-4 text-lg font-semibold">
          {{ category }}
        </h3>
        <el-form-item v-for="(v, k) in values" :key="k" class="border-b">
          <template #label>
            <span :class="mq.isMobile.value ? '!font-bold' : ''">{{ k }}</span>
          </template>
          <div :class="mq.isMobile.value ? 'ml-4' : ''">
            <template v-if="typeof v == 'object'">
              <div class="scrollValue">
                <pre class="" :class="mq.isMobile.value ? 'w-screen' : 'min-w-[250px]'">{{
                  JSON.stringify(v, null, 2)
                }}</pre>
              </div>
            </template>
            <template v-else>
              <code>{{ v }}</code>
            </template>
          </div>
        </el-form-item>
      </template>
    </div>
  </el-form>
</template>

<script setup lang="ts">
  import { debounce } from 'lodash'

  const mq = useMQ()
  const _props = defineProps({
    data: { type: Object, required: true },
    filter: { type: String, default: '' },
  })
  const rerenderKey = ref(0)
  const dataCopy = ref(_props.data)

  watch(
    () => [_props.filter, _props.data],
    () => debounceFilterData(),
    { deep: true }
  )

  const debounceFilterData = debounce(filterData, 600)
  function filterData() {
    if (_props.data == undefined || _props.filter == undefined || _props.filter.length <= 0) {
      dataCopy.value = _props.data
    }
    dataCopy.value = {}
    const filteredData: Record<string, any> = {}
    for (const [category, values] of Object.entries(_props.data)) {
      if (category == undefined || values == undefined) continue
      const filteredValues: Record<string, any> = {}
      for (const [key, value] of Object.entries(values)) {
        const keyvalue = key.toString() + JSON.stringify(value)
        const includes = keyvalue.toLowerCase().includes(_props.filter.toLowerCase())
        if (includes) {
          filteredValues[key] = value
        }
      }
      if (Object.keys(filteredValues).length > 0) {
        filteredData[category] = filteredValues
      }
    }
    rerenderKey.value++
    dataCopy.value = filteredData
  }
</script>

<style>
  div.scrollValue {
    max-height: 400px;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .diagnostics-form .el-form-item {
    margin-bottom: 7px;
  }
  .diagnostics-form .el-form-item__label {
    height: 28px;
    line-height: 28px;
  }
  .diagnostics-form .el-form-item__content {
    line-height: 28px;
  }
</style>
