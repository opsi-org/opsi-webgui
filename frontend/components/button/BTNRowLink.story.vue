<script setup lang="ts"></script>
<template>
  <Story :layout="{ type: 'grid' }">
    <Variant title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled>
      <ButtonBTNRowLink />
    </Variant>
    <Variant title="desktop" responsive-disabled>
      <ButtonBTNRowLink />
    </Variant>
  </Story>
</template>
