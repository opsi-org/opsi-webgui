<template>
  <el-row class="relative">
    <el-col
      :span="props.isMobile ? 24 : 24 / Object.keys($slots).length"
      class="border resize-x "
      :class="{
        ['max-width-1/'+Object.keys($slots).length]: !props.isMobile,
        'hidden': props.isMobile && Object.keys($slots).length > 1,
        // 'absolut top-0 left-0 bg-orange-300': props.isMobile
      }"
    >
      <slot :name="Object.keys($slots)[0]"/>
    </el-col>
    <el-col
      v-if="Object.keys($slots).length > 1"
      :span="props.isMobile ? 24 : 24 / Object.keys($slots).length"
      class="border resize-x"
      :class="{
        ['max-width-1/'+Object.keys($slots).length]: !props.isMobile,
        'hidden': props.isMobile && Object.keys($slots).length > 2,
        // 'absolut top-0 left-0 bg-orange-600': props.isMobile
      }"
    >
      <slot :name="Object.keys($slots)[1]"/>
    </el-col>
    <el-col
      v-if="Object.keys($slots).length > 2"
      :span="props.isMobile ? 24 : 24 / Object.keys($slots).length"
      class="border resize-x"
      :class="{
        ['max-width-1/'+Object.keys($slots).length]: !props.isMobile,
        // 'absolut top-0 left-0 bg-orange-800': props.isMobile
      }"
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

const props = defineProps({
  isMobile: { type: Boolean, default: ()=> {return useMQ().isMobile.value}}
})
onMounted(()=>{
})

</script>


<style scoped>
.el-col {
  resize: horizontal;
}
</style>