<template>
  <!-- <div class="container-fluid"> -->
  <!-- store {{ selectionDepots }} <br />
    local {{ selectionLocal }} <br />
    configserver {{ opsiconfigserver }} <br /> -->
    <!-- right -->
  <b-dropdown
    class="m-2"
    v-bind="$props"
    no-caret
    lazy
    alt="Show column"
  >
    <template #button-content>
      <b-icon-hdd-stack-fill /> Depots
    </template>
    <li
      id="selectableColumns-group"
      name="selectableColumns"
    >
      <a
        v-for="obj in fetchedData"
        :key="obj"
        class="dropdown-item"
        @click="handleItem(obj)"
      >
        <b-form-checkbox
          v-model="selectionLocal"
          :name="obj"
          :value="obj"
        />
        {{ obj }}
      </a>
    </li>
  </b-dropdown>
  <!-- </div> -->
</template>

<script lang="ts">
import { Component, Vue, namespace, Watch } from 'nuxt-property-decorator'
// import { IDepot } from '~/types/tsettings'
const selections = namespace('selections')

@Component export default class DDDepotIds extends Vue {
  opsiconfigserver:string = ''
  fetchedData: Array<string> = []
  selectionLocal: Array<string> = []
  // @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

  @Watch('selectionLocal', { deep: true }) selectionChanged () {
    if (this.selectionLocal.length === 0) {
      this.selectionLocal.push(this.opsiconfigserver)
    }
    this.setSelectionDepots([...this.selectionLocal])
    // this.setSelectionClients([])
  }

  handleItem (key: string) {
    if (this.selectionLocal.includes(key)) {
      this.selectionLocal = this.selectionLocal.filter(s => s !== key)
    } else {
      this.selectionLocal.push(key)
    }
  }

  async fetch () {
    this.opsiconfigserver = (await this.$axios.$get('/api/user/opsiserver')).result
    this.fetchedData = (await this.$axios.$get('/api/opsidata/depotIds')).result
    this.selectionLocal = [...this.selectionDepots]
  }
}
</script>

<style scoped>

.dropdown-item {
  display:flex !important;
}
</style>
