<template>
  <div data-testid="VHealthCheck" class="VHealthCheck">
    <BarBPageHeader v-if="asChild" :title="$t('title.healthcheck') + ' - '" :subtitle="id" :closeroute="closeroute" />
    <div> {{ $t('Health Check') }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class VHealthCheck extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string
}
</script>
