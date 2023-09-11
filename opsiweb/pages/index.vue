<template>
  <b-card class="text-center">
    <IconIOpsiLogo
      height="40%"
      :short="false"
      :light="true"
    />
    <h1 class="title">
      {{ $t("title.project") }}
    </h1>
    <IconIUibLogo
      height="20%"
      :short="false"
      :light="true"
    />
  </b-card>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PIndex extends Vue {
  $t:any
}
</script>