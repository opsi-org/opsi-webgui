<template>
  <div>
    <BarBPageHeader v-if="asChild" :title="'Config - ' + id" :closeroute="closeroute" />
    <BarBPageHeader v-if="!asChild">
      <template #selection>
        <slot name="IDSelection" />
      </template>
    </BarBPageHeader>
    <IconILoading v-if="isLoading" />
    <DivDScrollResult>
      <template slot="content">
        <b-tabs active-nav-item-class="font-weight-bold" content-class="mt-3">
          <b-tab title="Host Attributes" active>
            <LazyTableTHostAttributes v-if="id" :id="id" />
          </b-tab>
        </b-tabs>
      </template>
    </DivDScrollResult>
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

</style>
