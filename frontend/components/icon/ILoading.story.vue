<template>
  <Story :layout="{ type: 'grid' }">
    <Variant title="ILoading-default">
      <IconILoading />
    </Variant>
    <Variant title="ILoading-small">
      <IconILoading :small="true" />
    </Variant>
  </Story>
</template>

<script lang="ts" setup>
</script>