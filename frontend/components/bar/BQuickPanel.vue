<template>
  <div class="quickpanel"
  >
    Quick Select
    <el-tabs v-model="activeTab">
      <el-tab-pane label="All Selections" name="sel">
        <template #label>
          <span class="custom-tabs-label">
            <IconIIcon icon="laptop"/>
          </span>
        </template>
        All Selections
      </el-tab-pane>
      <el-tab-pane label="Servers" name="server">Servers</el-tab-pane>
      <el-tab-pane label="Client Groups" name="client">
        <TestEPTreeSelect />
      </el-tab-pane>
      <el-tab-pane label="Product Groups" name="prod">Product Group</el-tab-pane>
    </el-tabs>
    Settings <br/>
    <FormitemCBMultiselection />
    <FormitemCBQuicksave />
    <el-scrollbar v-if="changes.changesHostParam" class="max-h-48 overflow-scroll">
      <pre> {{ changes.changesHostParam }}</pre>
    </el-scrollbar>
    <el-scrollbar v-if="changes.changesProducts" class="max-h-48 overflow-scroll">
      <pre> {{ changes.changesProducts }}</pre>
    </el-scrollbar>

    <div class="menu-footer absolute inset-x-0 bottom-4 w-full flex justify-evenly">
      <FormitemDDTheme />
      <FormitemDDLang />
      <!-- <ButtonBTNLogout /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
const changes = storeChanges()
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
