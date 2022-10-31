<template>
  <div data-testid="VConfig" class="VConfig">
    <BarBPageHeader v-if="asChild" :title="$t('title.config') + ' - '" :subtitle="id" :closeroute="closeroute" />
    <BarBPageHeader v-if="!asChild">
      <template #left>
        <slot name="IDSelection" />
      </template>
    </BarBPageHeader>
    <IconILoading v-if="isLoading" />
    <b-tabs class="config_horizontaltabs" lazy>
      <b-tab active>
        <template #title>
          <span class="hostattr"> {{ $t('title.hostattr') }} </span>
        </template>
        <DivDScrollResult>
          <LazyFormFHostAttributes v-if="id" :id="id" :type="type" />
          <div v-else style="height: 70vh;" />
        </DivDScrollResult>
      </b-tab>
      <b-tab v-if="type == 'clients' || id == opsiconfigserver">
        <template #title>
          <span class="hostparam"> {{ $t('title.hostparam') }} </span>
        </template>
        <DivDScrollResult>
          <LazyGridGHostParam v-if="id" :id="id" :type="type" />
          <div v-else style="height: 70vh;" />
        </DivDScrollResult>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
const cache = namespace('data-cache')
@Component
export default class VConfig extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) type!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string
  @cache.Getter public opsiconfigserver!: string

  isLoading: boolean = false
}
</script>
<style>
.config_horizontaltabs .nav-item{
  min-width: 10%;
}
</style>
