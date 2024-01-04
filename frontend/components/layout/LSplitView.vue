<template>

  <el-container>
    <el-main v-if="props.page0Condition"
      :class="classfirstcol"
      class="mt-1"
      >
      <slot />
    </el-main>
    <el-aside v-if="props.page1Condition" :width="width"
      :class="{[props.classlastcol]: !props.page2Condition}"
      class="mt-1"
      >
      <slot name="page1" />
    </el-aside>
    <el-aside v-if="props.page2Condition"
      :width="width"
      :class="props.classlastcol"
      class="mt-1">
      <slot name="page2" />
    </el-aside>
  </el-container>
</template>

<script setup lang="ts">

const props = defineProps({
  isMobile: { type: Boolean, default: ()=> {return useMQ().isMobile.value}},
  page0Condition: { type: Boolean, default: true },
  page1Condition: { type: Boolean, default: false },
  page2Condition: { type: Boolean, default: false },
  width: { type: String, default: '0%' },
  classfirstcol: { type: String, default: 'ml-5 mr-5' },
  classlastcol: { type: String, default: 'mr-5' },
})
onMounted(()=>{
})

</script>

<style scoped>
.el-main {
  padding: 0px !important;
  /* border: 1px solid #ddd; */
  /* resize: horizontal; */
}
.el-aside {
  /* border: 1px solid #ddd; */
  /* resize: horizontal; */
}
</style>