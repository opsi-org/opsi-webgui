<template>
  <div data-testid="VConfig">
    <BarBPageHeader v-if="asChild" :title="$t('title.config') + ' - '" :subtitle="id" :closeroute="closeroute" />
    <BarBPageHeader v-if="!asChild">
      <template #left>
        <slot name="IDSelection" />
      </template>
    </BarBPageHeader>
    <IconILoading v-if="isLoading" />
    <b-tabs class="config_horizontaltabs">
      <b-tab title="Host Attributes" active>
        <DivDScrollResult>
          <LazyTableTHostAttributes v-if="id" :id="id" />
        </DivDScrollResult>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class VClientConfig extends Vue {
  @Prop({ }) id!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string

  isLoading: boolean = false
}
</script>
<style>
.config_horizontaltabs .nav-item{
  min-width: 10%;
}
</style>
