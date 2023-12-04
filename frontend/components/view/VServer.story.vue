<script setup lang="ts">
import {loginlogout} from '~/histoire/histoire-utils'
</script>

<template>
  <Story :setup-app="loginlogout">
    <ViewVServer />
    <!-- {{  logout() }} -->
  </Story>
</template>