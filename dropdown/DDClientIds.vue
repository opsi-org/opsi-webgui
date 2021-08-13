<template>
  <!-- <div class="container-fluid"> -->
  <!-- store {{ selectionDepots }} <br />
    local {{ selectionLocal }} <br />
    configserver {{ opsiconfigserver }} <br /> -->
  <b-dropdown
    class="m-2"
    v-bind="$props"
    no-caret
    lazy
    alt="Show column"
  >
    <template #button-content>
      <b-icon-laptop /> Clients
    </template>
    <li
      id="selectableColumns-group"
      name="selectableColumns"
      class="ddclientIds-li"
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
interface ClientRequest {
    selectedDepots: string
}

@Component export default class DDDepotIds extends Vue {
  clientRequest: ClientRequest = { selectedDepots: '' }
  // opsiconfigserver:string = ''
  fetchedData: Array<string> = []
  selectionLocal: Array<string> = []
  // @selections.Getter public selectionClients!: Array<string>
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

  @Watch('selectionDepots', { deep: true })
  selectionDepotsChanged () { this.$fetch() }

  @Watch('selectionLocal', { deep: true }) selectionChanged () {
    // if (this.selectionLocal.length === 0) {
    //   this.selectionLocal.push(this.opsiconfigserver)
    // }
    this.setSelectionClients([...this.selectionLocal])
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
    this.clientRequest.selectedDepots = JSON.stringify(this.selectionDepots)
    const params = this.clientRequest
    this.fetchedData = (await this.$axios.$get('/api/opsidata/depots/clients', { params })).result.clients.sort()
    // this.opsiconfigserver = (await this.$axios.$post('/api/user/opsiserver')).result
    this.selectionLocal = [...this.selectionClients]
  }
}
</script>

<style scoped>
.ddclientIds-li {
  max-height: 400px !important;
  overflow: auto;
  /* width: 100px; */
}
.dropdown-item {
  display:flex !important;
}
</style>
