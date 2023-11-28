<script setup lang="ts">
import {loginlogout} from '~/histoire-utils'
</script>

<template>
  <Story
    :setup-app="loginlogout"
  >
    <TableTDefault />
    <!-- {{  logout() }} -->
  </Story>
</template>