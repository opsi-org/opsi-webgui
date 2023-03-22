<template>
  <ViewVHealthCheck :as-child="false" />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PServerHealthCheck extends Vue {
}
</script>
