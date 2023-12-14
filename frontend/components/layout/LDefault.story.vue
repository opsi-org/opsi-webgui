<script setup lang="ts">

function initMobile(data: any) {
  const settings = storeSettings()
  settings.setIsMobile(true)
}
function initDesktop(data: any) {
  const settings = storeSettings()
  settings.setIsMobile(false)
}
const getTheme = () => {
  const settings = storeSettings()
  return settings.colortheme
}
const getThemeDoc = () => {
  return document.querySelector('html')?.classList.contains('dark') ? 'dark' : document.querySelector('html')?.classList.contains('htw-dark') ? 'dark' : 'light'
}
</script>

<template>

  <Story >
    <Variant title="mobile" :meta="{ wrapperMobile: true }" :setup-app="initMobile" responsive-disabled>
      <LayoutLDefault>
        <el-text>
          Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content </el-text>
        <el-text> Store: {{ getTheme() }} </el-text>
        <el-text> Doc: {{ getThemeDoc() }} </el-text>
      </LayoutLDefault>
    </Variant>
    <Variant title="desktop" responsive-disabled :setup-app="initDesktop">
      <LayoutLDefault>
        <el-text>
          Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content Some content
        </el-text>
      </LayoutLDefault>
    </Variant>
  </Story>
</template>
