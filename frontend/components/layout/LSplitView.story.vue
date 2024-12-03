<script setup lang="ts">
  const views = ref({
    1: {
      title: 'mobile-default',
      props: {
        isMobile: true,
        page0Condition: true, // necessary
        page1Condition: false, // optional
        page2Condition: false, // optional
        width: '100%',
        classlastcol: '',
        classcontainer: '',
      },
    },
    2: {
      title: 'mobile-two cols',
      props: {
        isMobile: true,
        page0Condition: true,
        page1Condition: true,
        page2Condition: false,
        width: '50%',
        classlastcol: '',
        classcontainer: '',
      },
    },
    3: {
      title: 'mobile-three cols',

      props: {
        isMobile: true,
        page0Condition: true,
        page1Condition: true,
        page2Condition: true,
        width: '33%',
        classlastcol: '',
        classcontainer: '',
      },
    },
    4: {
      title: 'desktop-default',
      props: {
        isMobile: false,
        page0Condition: true,
        page1Condition: false,
        page2Condition: false,
        width: '0%',
        classlastcol: '',
        classcontainer: '',
      },
    },
    5: {
      title: 'desktop-two cols',
      props: {
        isMobile: false,
        page0Condition: true,
        page1Condition: true,
        page2Condition: false,
        width: '50%',
        classlastcol: '',
        classcontainer: '',
      },
    },
    6: {
      title: 'desktop-three cols',
      props: {
        isMobile: false,
        page0Condition: true,
        page1Condition: true,
        page2Condition: true,
        width: '33%',
        classlastcol: '',
        classcontainer: '',
      },
    },
  })
</script>

<template>
  <Story :layout="{ type: 'grid', width: '100%' }">
    <Variant
      v-for="(v, k) in views"
      :key="k"
      :title="v.title"
      :meta="{ wrapperMobile: v.props.isMobile }"
      responsive-disabled
    >
      <LayoutLSplitView
        :is-mobile="v.props.isMobile"
        :page0-condition="v.props.page0Condition || true"
        :page1-condition="v.props.page1Condition || false"
        :page2-condition="v.props.page2Condition || false"
        :width="v.props.width"
        :classlastcol="v.props.classlastcol"
        :classcontainer="v.props.classcontainer"
      >
        <template #default>
          <el-text> Some content main </el-text>
        </template>
        <template #page1>
          <el-text> Some content page1 </el-text>
        </template>
        <template #page2>
          <el-text> Some content page2 </el-text>
        </template>
      </LayoutLSplitView>
    </Variant>
    <!-- <Variant title="mobile-default" :meta="{ wrapperMobile: true }" responsive-disabled>
      <LayoutLSplitView :is-mobile="true">
        <el-text> Some content </el-text>
      </LayoutLSplitView>
    </Variant> -->
  </Story>
</template>
<style scoped>
  :deep(.el-aside) {
    border: 1px solid #ddd;
  }
  :deep(.el-main) {
    border: 1px solid #ddd;
  }
</style>
