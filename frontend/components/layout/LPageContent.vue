<template>
  <el-row class="">
    <el-col
      :span="24 / Object.keys($slots).length"
      class="border resize-x"
      :class="'max-width-1/'+Object.keys($slots).length"
    >
      <slot :name="Object.keys($slots)[0]"/>
    </el-col>
    <el-col
      v-if="Object.keys($slots).length > 1"
      :span="24 / Object.keys($slots).length"
      class="border resize-x"
      :class="'max-width-1/'+Object.keys($slots).length"
    >
      <slot :name="Object.keys($slots)[1]"/>
    </el-col>
    <el-col
      v-if="Object.keys($slots).length > 2"
      :span="24 / Object.keys($slots).length"
      class="border resize-x"
      :class="'max-width-1/'+Object.keys($slots).length"
    >
      <slot :name="Object.keys($slots)[2]"/>
    </el-col>
      <!-- <el-container class="h-full max-h-full overflow-hidden">
        <el-aside class="border-red-500 w-auto">
          <slot/>
        </el-aside>

        <el-main class="w-auto">
            <slot name="page1"/>
        </el-main>

        <el-aside class="border-green-500">
          <slot name="page2"/></el-aside>
      </el-container> -->
  </el-row>
</template>

<script setup lang="ts">
onMounted(()=>{
})
</script>


<style scoped>
.el-col {
  resize: horizontal;
}
</style>