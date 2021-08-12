<template>
  <DivDScrollResult>
    <template slot="content">
      <b-table :busy="isLoading" stacked :items="[modules]" :fields="['valid', 'expires']">
        <template #table-busy>
          <IconILoading />
        </template>
        <!-- <template #cell(signature)="row">
          <b-input-group>
            <b-form-input v-model="row.item.signature" size="sm" readonly :type="hideValue ? 'text': 'password' " />
            <b-button :pressed.sync="hideValue" size="sm">
              <b-icon v-if="hideValue" icon="eye-slash" />
              <b-icon v-else icon="eye" />
            </b-button>
          </b-input-group>
        </template> -->
      </b-table>
      <!-- <div v-for="v,k in modules" :key="k">
              <p>{{ k }}:{{ v }}</p>
            </div> -->
    </template>
  </DivDScrollResult>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class VModules extends Vue {
  isLoading: boolean = false
  modules: object = {}
  hideValue : boolean = false

  // async asyncData ({ $axios }: any): Promise<any> {
  //   return {
  //     modules: (await $axios.$post('/api/opsidata/modulesContent')).result
  //   }
  // }

  async fetch () {
    this.isLoading = true
    this.modules = (await this.$axios.$get('/api/opsidata/modulesContent')).result
    this.isLoading = false
  }
}
</script>

<style>

</style>
