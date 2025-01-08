<template>
  <Story :layout="{ type: 'grid' }">
    <Variant v-for="(v, k) in icons" :key="k" :title="'' + k">
      <IconIIcon :icon="v" />
    </Variant>
  </Story>
</template>

<script lang="ts" setup>
  const icons = useIcons()
</script>
