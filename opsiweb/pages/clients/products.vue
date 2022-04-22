<template>
  <ViewVProducts :sortby="sortby" :child="true" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class PClientsProductsColumn extends Vue {
  @Prop({ }) sortby!: string
}
</script>
