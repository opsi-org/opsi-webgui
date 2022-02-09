<template>
  <div class="tablediv">
    <p v-if="error">
      {{ error }}
    </p>
    <b-table
      v-else
      id="table"
      ref="table"
      primary-key="table"
      :class="items.length <10 ? 'smalltable' : 'infinitescrolltable'"
      sticky-header
      responsive
      :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
      :items="items"
      selectable
      :select-mode="selectmode"
      @row-selected="onRowSelected"
    >
      <template #head(sel)="{}">
        {{ selected.length }}/{{ totalItems }}
        <b-button
          v-if="selected.length>0"
          v-b-tooltip.hover
          title="Clear selected"
          variant="light"
          size="sm"
          @click="clearSelected"
        >
          <b-icon-brush />
        </b-button>
      </template>
      <template #head(clientId)>
        <InputIFilter :data="tableData" :additional-title="$t('table.fields.id')" />
      </template>
      <template #head(rowactions)="{}">
        <DropdownDDTableColumnVisibilty table-id="table" :headers="headerData" />
      </template>
      <template #cell(sel)="{ rowSelected }">
        <template v-if="rowSelected">
          <span aria-hidden="true">&check;</span>
          <span class="sr-only">Selected</span>
        </template>
        <template v-else>
          <span aria-hidden="true">&nbsp;</span>
          <span class="sr-only">Not selected</span>
        </template>
      </template>
      <template
        v-for="slotName in Object.keys($scopedSlots)"
        #[slotName]="slotScope"
      >
        <slot :name="slotName" v-bind="slotScope" />
      </template>
    </b-table>

    <span class="tablefooter">Showing {{ items.length }} Clients from page {{ tableData.pageNumber }} / {{ totalpages }}</span>

    <b-overlay :show="isLoading" no-wrap opacity="0.5" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, namespace, Vue } from 'nuxt-property-decorator'
import { ITableData, ITableHeaders } from '../../.utils/types/ttable'
const selections = namespace('selections')
@Component
export default class TInfiniteScrollClients extends Vue {
  @Prop({ }) ismultiselect!: boolean

  $axios: any
  $mq: any
  $fetch:any

  isLoading: Boolean = false
  items: Array<any> = []
  totalItems: number = 0
  totalpages: number = 0
  error: string = ''
  selected: Array<object> = []

  tableData: ITableData = {
    pageNumber: 1,
    perPage: 15,
    sortBy: 'clientId',
    sortDesc: false,
    filterQuery: '',
    setPageNumber: () => {},
    setPerPage: () => {}
  }

  headerData: ITableHeaders = {
    sel: { label: '', key: 'sel', visible: true, _fixed: true },
    clientId: { label: this.$t('table.fields.id') as string, key: 'clientId', visible: true, _fixed: true, sortable: true },
    description: { label: this.$t('table.fields.description') as string, key: 'description', visible: false, sortable: true },
    ipAddress: { label: this.$t('table.fields.ip') as string, key: 'ipAddress', visible: false, sortable: true },
    macAddress: { label: this.$t('table.fields.hwAddr') as string, key: 'macAddress', visible: false, sortable: true },
    _majorStats: { label: this.$t('table.fields.stats') as string, key: '_majorStats', _isMajor: true, visible: false },
    version_outdated: { label: this.$t('table.fields.versionOutdated') as string, key: 'version_outdated', _majorKey: '_majorStats', visible: true, sortable: true },
    actionResult_failed: { label: this.$t('table.fields.actionRequestFailed') as string, key: 'actionResult_failed', _majorKey: '_majorStats', visible: true, sortable: true },
    rowactions: { key: 'rowactions', label: this.$t('table.fields.rowactions') as string, visible: true, _fixed: true }
  }

  @selections.Getter public selectionDepots!: Array<string>

  @Watch('selectionDepots', { deep: true }) selectionDepotsChanged () { this.$fetch() }
  @Watch('tableData', { deep: true }) tableDataChanged () { this.$fetch() }

  get selectmode () {
    if (this.ismultiselect) {
      return 'multi'
    } else { return 'single' }
  }

  async fetch () {
    this.isLoading = true
    this.tableData.selectedDepots = JSON.stringify(this.selectionDepots)
    const params = this.tableData
    await this.$axios.get('/api/opsidata/clients', { params })
      .then((response) => {
        this.totalItems = response.headers['x-total-count']
        this.totalpages = Math.ceil(this.totalItems / this.tableData.perPage)
        this.items = response.data
        // this.items = this.items.concat(response.data)
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.error = this.$t('message.errortext') as string
      })
    this.isLoading = false
  }

  mounted () {
    const tableScrollBody = (this.$refs.table as any).$el
    tableScrollBody.addEventListener('scroll', this.onScroll)
  }

  onRowSelected (items) {
    this.selected = items
  }

  clearSelected () {
    (this.$refs.table as any).clearSelected()
    // this.selected = []
  }

  onScroll (event) {
    if (this.items.length > 1) {
    // On Scroll Up
      if (
        event.target.scrollTop === 0) {
        if (!this.isLoading) {
          if (this.tableData.pageNumber === 1) {
            return
          }
          this.tableData.pageNumber--
          this.$fetch()
          event.target.scrollTop = event.target.clientHeight - 5
        }
      } else
      if ( // On Scroll Down
        event.target.scrollTop + event.target.clientHeight >=
        event.target.scrollHeight
      ) {
        if (!this.isLoading) {
          if (this.tableData.pageNumber === this.totalpages) {
            return
          }
          this.tableData.pageNumber++
          this.$fetch()
          event.target.scrollTop = 5
        }
      }
    }
  }
}
</script>

<style>
.tablefooter {
  color: gray;
  font-size: 15px;
}
.infinitescrolltable.b-table-sticky-header {
  max-height: 70vh;
}
.smalltable.b-table-sticky-header {
  max-height: 10vh;
}
</style>
