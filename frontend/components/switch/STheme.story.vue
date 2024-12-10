<template>
  <Story>
    <Variant :meta="{ wrapperMobile: true }" responsive-disabled>
      <SwitchSTheme />
    </Variant>
  </Story>
</template>

<script setup lang="ts">
  const settings = storeSettings()
  settings.initColormode() // Needed in defaultLayouts initially
</script>
