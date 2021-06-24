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
        <!-- <template v-if="id === opsiconfigserver"> -->
        <CollapseCContent title="General">
          <template #content>
            <TableTGeneralConfig />
          </template>
        </CollapseCContent>
        <CollapseCContent title="Host Parameters">
          <template #content>
            <TableTHostParam />
          </template>
        </CollapseCContent>
        <!-- </template> -->
        <!-- <template v-else>
          <TableTGeneralConfig />
        </template> -->
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
  // opsiconfigserver: string = ''

  // async fetch () {
  //   this.opsiconfigserver = (await this.$axios.$post('/api/user/opsiserver')).result
  // }
}
</script>

<style>

</style>
