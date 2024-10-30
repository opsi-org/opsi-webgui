<template>
  <div>
  <el-container
    :class="{
      [classcontainer]: true,
      // 'border-red-500 border-1': true
      // 'max-w-screen': isMobile
      }"
    >
    <el-main
      v-if="page0Condition"
      class="mycol"
      :class="{
        [props.classfirstcol]: !isMobile,
        [props.classeachcol]: true,
        [props.classmaincol]: $props.classmaincol
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
        [props.classlastcol]: !isMobile && !page2Condition
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
        [props.classeachcol]: true
      }"
    >
      <slot name="page2" />
    </el-aside>
  </el-container>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  isMobile: { type: Boolean, default: ()=> {return useMQ().isMobile.value}},
  page0Condition: { type: Boolean, default: true },
  page1Condition: { type: Boolean, default: false },
  page2Condition: { type: Boolean, default: false },
  width: { type: String, default: '0%' },
  // classeachcol: { type: String, default: 'mt-1' },
  classeachcol: { type: String, default: '' },
  classfirstcol: { type: String, default: '' },
  // classfirstcol: { type: String, default: 'ml-5 mr-5' },
  classlastcol: { type: String, default: '' },
  // classlastcol: { type: String, default: 'mr-5' },
  classcontainer: { type: String, default: 'pagecontent' },
  classmaincol: { type: String, default: '' },
})
onMounted(()=>{
})
const width = computed(()=> {
  if (props.isMobile) {
    return '100%' // for mobile we overlap pages
  }
  return props.width
})
const page0Condition = computed(()=> {
  if (props.isMobile && (page1Condition.value || page2Condition.value))
    return false
  return props.page0Condition
})
const page1Condition = computed(()=> {
  if (props.isMobile && page2Condition.value)
    return false
  return props.page1Condition
})
const page2Condition = computed(()=> {
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
  --above-main: 180px;
  height: calc(100vh - var(--above-main)) !important;
  max-height: calc(100vh - var(--above-main)) !important;
}
.el-main {
  padding: 0px !important;
  --above-main: 120px;
  height: calc(100vh - var(--above-main)) !important;
  max-height: calc(100vh - var(--above-main)) !important;
}
</style>