<template>
  <div
  >
    Quick Select
    <el-tabs v-model="activeTab">
      <el-tab-pane label="All Selections" name="sel">All Selections</el-tab-pane>
      <el-tab-pane label="Servers" name="server">Servers</el-tab-pane>
      <el-tab-pane label="Client Groups" name="client">
        <TestEPTreeSelect />
      </el-tab-pane>
      <el-tab-pane label="Product Groups" name="prod">Product Group</el-tab-pane>
    </el-tabs>
    Settings <br/>
    <FormitemDDTheme />
    <FormitemDDLang />
    <FormitemCBMultiselection />
  </div>
</template>

<script setup lang="ts">
const mq = useMQ()

const activeTab = ref('client')
</script>

