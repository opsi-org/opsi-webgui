<template>
  <h5>{{  $t('title.properties') }}</h5>
  <h6>{{ id }}</h6>
  <el-tabs v-model="activeName" class="demo-tabs">
    <el-tab-pane
      :label="$t('title.prodproperties')"
      name="properties"
      active
      >
      <!-- :disabled="!(type == 'clients' || type == 'depots')" -->
        <!-- <FormFHostParameter v-if="activeName==='config'" :id="id" :type="type"/> -->
        Properties
      </el-tab-pane>
    <el-tab-pane :label="$t('title.dependencies')" name="dependencies"
    >
    <!-- :disabled="isIdEmpty" -->
    Dependencies
      <!-- <el-scrollbar >
        <FormFHostAttributes :id="id" :type="type"/>
      </el-scrollbar> -->
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">

const props = defineProps({
  id: { type: String, default: undefined },
  type: { type: String, default: 'product' },
  isChild: { type: Boolean, default: true }
})
const activeName = ref('properties')
</script>