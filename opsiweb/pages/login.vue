<template>
  <FormFLogin />
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({ layout: 'auth' })
export default class PLogin extends Vue {}
</script>
