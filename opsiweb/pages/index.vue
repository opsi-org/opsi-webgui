<template>
  <b-card class="text-center">
    <IconIOpsiLogo height="60%" />
    <h1>  {{ $t("title.project") }} </h1>
  </b-card>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PIndex extends Vue {
  $t:any
}
</script>
