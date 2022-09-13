<template>
  <div data-testid="VConfig" class="VConfig">
    <BarBPageHeader v-if="asChild" :title="$t('title.config') + ' - '" :subtitle="id" :closeroute="closeroute" />
    <BarBPageHeader v-if="!asChild">
      <template #left>
        <slot name="IDSelection" />
      </template>
    </BarBPageHeader>
    <IconILoading v-if="isLoading" />
    <b-tabs class="config_horizontaltabs">
      <b-tab active>
        <template #title>
          <span class="hostattr"> {{ $t('title.hostattr') }} </span>
        </template>
        <DivDScrollResult>
          <LazyFormFHostAttributes v-if="id" :id="id" :type="type" />
          <div v-else style="height: 70vh;" />
        </DivDScrollResult>
      </b-tab>
    </b-tabs>
    <b-tabs class="config_horizontaltabs">
      <b-tab active>
        <template #title>
          <span class="hostparam"> {{ $t('title.hostparam') }} </span>
        </template>
        <DivDScrollResult>
          <LazyTableTHostParam v-if="id" :type="type" />
          <!-- <template v-if="id">
            <span v-for="v,k in hostparams" :key="k">
              <b-button class="text-left font-weight-bold" block v-b-toggle="'collapse-'+k" variant="transparent">{{k}}</b-button>
              <b-collapse :id="'collapse-'+k" accordion="hostparam">
                <b-table-lite :fields="['configId', 'description', 'value']" :items="v"></b-table-lite>
              </b-collapse>
            </span>
          </template> -->
          <div v-else style="height: 70vh;" />
        </DivDScrollResult>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class VConfig extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) type!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string

  isLoading: boolean = false
}
</script>
<style>
.config_horizontaltabs .nav-item{
  min-width: 10%;
}
/* .VConfig,
.VConfig > .navbar {
  overflow: visible;
} */
</style>
