<template>
  <Story :layout="{ type: 'grid' }">
    <Variant v-for="v,k in icons" :title="'' + k">
      <IconIIcon :icon="v"/>
    </Variant>
  </Story>
</template>

<script lang="ts" setup>
import { useIcons } from '../../composables/mixins/useIcons';

const icons = useIcons()
</script>