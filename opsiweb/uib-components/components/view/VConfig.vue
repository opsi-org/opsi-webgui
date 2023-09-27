<template>
  <div data-testid="VConfig" class="VConfig">
    <BarBPageHeader v-if="asChild" :title="$t('title.config') + '' + $t('keep-english.title.delimiter')" :subtitle="id" :closeroute="closeroute" />
    <BarBPageHeader v-if="!asChild">
      <template #left>
        <slot name="IDSelection" />
      </template>
    </BarBPageHeader>
    <b-tabs small lazy>
      <b-tab :active="id? true : false" :disabled="!id">
        <template #title>
          <span class="hostattr"> {{ $t('title.hostattr') }} </span>
        </template>
        <LazyGridGHostAttributes v-if="id" :id="id" :type="type" />
        <div v-else style="height: 70vh;" />
      </b-tab>
      <b-tab v-if="type == 'clients' || type == 'depots'">
        <template #title>
          <span data-testid="Parameters" class="hostparam"> {{ $t('title.hostparam') }} </span>
        </template>
        <LazyGridGHostParam v-if="type=='depots' || id" :id="id" :type="type" />
        <div v-else style="height: 70vh;" />
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
}
</script>
