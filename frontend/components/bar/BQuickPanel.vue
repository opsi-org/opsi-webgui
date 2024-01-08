<template>
  <div class="quickpanel"
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
    <FormitemCBMultiselection />
    <div class="menu-footer absolute inset-x-0 bottom-4 w-full flex justify-evenly">
      <FormitemDDTheme />
      <FormitemDDLang />
      <ButtonBTNLogout />
    </div>
  </div>
</template>

<script setup lang="ts">
const mq = useMQ()

const activeTab = ref('client')
</script>

<style>
/* .el-tabs__item.is-active {
  color: var(--fg-color) !important;
  background-color: var(--bg-color) !important;
  border-color: var(--border-color) !important;
} */
</style>
