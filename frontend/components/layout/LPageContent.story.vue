<template>
  <Story
    :layout="{ type: 'grid', width: '100%'}"
  >
    <Variant title="mobile-default" :meta="{ wrapperMobile: true }" responsive-disabled>
      <LayoutLPageContent >
        <el-text> Some content </el-text>
      </LayoutLPageContent>
    </Variant>

    <Variant title="mobile-two cols" :meta="{ wrapperMobile: true }" responsive-disabled>
      <LayoutLPageContent>
        <template #default>
          <el-text> Some content </el-text>
        </template>
        <template #page1>
          <el-text> Some content page1 </el-text>
        </template>
      </LayoutLPageContent>
    </Variant>
    <Variant title="mobile-three cols" :meta="{ wrapperMobile: true }" responsive-disabled>
      <LayoutLPageContent >
        <template #default>
          <el-text> Some content </el-text>
        </template>
        <template #page1>
          <el-text> Some content page1 </el-text>
        </template>
        <template #page2>
          <el-text> Some content page2 </el-text>
        </template>
      </LayoutLPageContent>
    </Variant>

    <Variant title="desktop-default" responsive-disabled>
      <LayoutLPageContent >
        <el-text> Some content </el-text>
      </LayoutLPageContent>
    </Variant>
    <Variant title="desktop-two cols" responsive-disabled>
      <LayoutLPageContent >
        <template #default>
          <el-text> Some content </el-text>
        </template>
        <template #page1>
          <el-text> Some content page1 </el-text>
        </template>
      </LayoutLPageContent>
    </Variant>
    <Variant title="desktop-three cols" responsive-disabled>
      <LayoutLPageContent >
        <template #default>
          <el-text> Some content </el-text>
        </template>
        <template #page1>
          <el-text> Some content page1 </el-text>
        </template>
        <template #page2>
          <el-text> Some content page2 </el-text>
        </template>
      </LayoutLPageContent>
    </Variant>
  </Story>
</template>
