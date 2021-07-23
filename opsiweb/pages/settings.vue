<template>
  <div class="container-fluid">
    <b-tabs>
      <b-tab title="Modules content" active>
        <DivDScrollResult>
          <template slot="content">
            <b-table stacked :items="[modules]" />
            <!-- <div v-for="v,k in modules" :key="k">
              <p>{{ k }}:{{ v }}</p>
            </div> -->
          </template>
        </DivDScrollResult>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class PSettings extends Vue {
  async asyncData ({ $axios }: any): Promise<any> {
    return {
      modules: (await $axios.$post('/api/opsidata/modulesContent')).result
    }
  }
}
</script>

<style>
</style>
