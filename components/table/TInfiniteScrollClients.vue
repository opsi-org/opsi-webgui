<template>
  <div class="tablediv">
    <p v-if="error">
      {{ error }}
    </p>
    <TableTbvtable
      v-else
      id="tableclients"
      ref="tableclients"
      primary-key="tableclients"
      :is-loading="isLoading"
      :table-data="tableData"
      :header-data="headerData"
      :items="items"
      :total-items="totalItems"
      :ismultiselect="ismultiselect"
      :selection="selectionClients"
      :setselection="setSelectionClients"
    />
    <!-- <b-table
      v-else
      id="tableclients"
      ref="tableclients"
      primary-key="tableclients"
      :class="items.length <10 && items.length > 0 ? 'smalltable' : 'infinitescrolltable'"
      sticky-header
      show-empty
      responsive
      :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
      :items="items"
      selectable
      selected-variant=""
      :select-mode="selectmode"
      @row-clicked="onRowClicked"
    >
      <template #empty>
        --
      </template>
      <template #head(sel)="{}">
        {{ selectionClients.length }}/{{ totalItems }}
        <b-button
          v-if="selectionClients.length>0"
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
      <template #cell(sel)="row">
        <b-icon-check2 v-if="selectionClients.includes(row.item.ident)" />
        {{ fixRow(row) }}
      </template>
      <template
        v-for="slotName in Object.keys($scopedSlots)"
        #[slotName]="slotScope"
      >
        <slot :name="slotName" v-bind="slotScope" />
      </template>
    </b-table> -->
    <span v-if="items.length>0" class="tablefooter">Showing {{ items.length }} Clients from page {{ tableData.pageNumber }} / {{ totalpages }}</span>
    <b-overlay :show="isLoading" no-wrap opacity="0.5" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, namespace, Vue } from 'nuxt-property-decorator'
import { ITableData, ITableHeaders, ITableDataItem, ITableRow } from '../../.utils/types/ttable'
const selections = namespace('selections')
@Component
export default class TInfiniteScrollClients extends Vue {
  @Prop({ }) ismultiselect!: boolean

  $axios: any
  $mq: any
  $fetch:any
  $nuxt:any

  isLoading: Boolean = false
  items: Array<any> = []
  totalItems: number = 0
  totalpages: number = 0
  error: string = ''

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
  @selections.Getter public selectionClients!: Array<string>
  @selections.Mutation public pushToSelectionClients!: (s: string) => void
  @selections.Mutation public setSelectionClients!: (s: Array<string>) => void

  @Watch('selectionDepots', { deep: true }) selectionDepotsChanged () { this.$fetch() }
  @Watch('tableData', { deep: true }) tableDataChanged () { this.$fetch() }

  // get selectmode () {
  //   if (this.ismultiselect) {
  //     return 'multi'
  //   } else { return 'single' }
  // }

  async fetch () {
    this.isLoading = true
    this.tableData.selectedDepots = JSON.stringify(this.selectionDepots)
    const params = this.tableData
    await this.$axios.get('/api/opsidata/clients', { params })
      .then((response) => {
        this.totalItems = response.headers['x-total-count']
        this.totalpages = Math.ceil(this.totalItems / this.tableData.perPage)
        if (response.data === null) {
          this.items = []
        } else {
          this.items = response.data
        }
        // this.items = this.items.concat(response.data)
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.error = this.$t('message.errortext') as string
      })
    this.isLoading = false
  }

  mounted () {
    this.$nextTick(() => {
      this.$nuxt.$loading.start()
      setTimeout(() => this.$nuxt.$loading.finish(), 500)
      const tableScrollBody = (this.$refs.tableclients as any).$el
      tableScrollBody.addEventListener('scroll', this.onScroll)
    })
  }

  beforeDestroy () {
    const tableScrollBody = (this.$refs.tableclients as any).$el
    tableScrollBody.removeEventListener('scroll', this.onScroll)
  }

  onScroll (event) {
    if (this.items.length === 0) {
      const tableScrollBody = (this.$refs.tableclients as any).$el
      tableScrollBody.removeEventListener('scroll', this.onScroll)
      console.log('scroliong')
    } else if ( // On Scroll Up
      event.target.scrollTop === 0) {
      if (!this.isLoading) {
        if (this.tableData.pageNumber === 1) {
          return
        }
        this.tableData.pageNumber--
        this.$fetch()
        event.target.scrollTop = event.target.clientHeight - 5
      }
    } else if ( // On Scroll Down
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

  // fixRow (row: ITableRow): void {
  //   const rowIdent = row.item.ident as any
  //   row.rowSelected = this.selectionClients.includes(rowIdent)
  //   const elem = document.getElementById(`table__row_${rowIdent}`)
  //   if (row.rowSelected) {
  //     row.item._rowVariant = 'primary'
  //     if (elem) {
  //       elem.classList.add('table-active')
  //       elem.classList.add('b-table-row-selected')
  //       elem.classList.add('table-primary')
  //       elem.classList.add('aaaa')
  //     }
  //   } else {
  //     row.item._rowVariant = ''
  //     if (elem) {
  //       elem.classList.remove('table-active')
  //       elem.classList.remove('b-table-row-selected')
  //       elem.classList.remove('table-primary')
  //       elem.classList.remove('aaaa')
  //     }
  //   }
  // }

  // onRowClicked (item:ITableDataItem) {
  //   const ident = item.ident
  //   const selectionCopy:Array<string> = [...this.selectionClients]
  //   if (this.ismultiselect) {
  //     if (selectionCopy.includes(ident)) {
  //       selectionCopy.splice(selectionCopy.indexOf(ident), 1)
  //     } else {
  //       selectionCopy.push(ident)
  //     }
  //     this.setSelectionClients(selectionCopy)
  //   } else if (selectionCopy.includes(ident)) {
  //     this.setSelectionClients([])
  //   } else {
  //     this.setSelectionClients([ident])
  //   }
  // }

  // clearSelected () {
  //   this.setSelectionClients([])
  // }
}
</script>

<style>
.tablefooter {
  color: gray;
  font-size: 15px;
}
/* .infinitescrolltable.b-table-sticky-header {
  max-height: 70vh;
}
.smalltable.b-table-sticky-header {
  max-height: 10vh;
} */
</style>
