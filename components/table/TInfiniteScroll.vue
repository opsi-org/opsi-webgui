<template>
  <div data-testid="TInfiniteScroll">
    <p v-if="error">
      {{ error }}
    </p>
    <b-table
      v-else
      :id="id"
      :ref="id"
      :stacked="$mq=='mobile'"
      :primary-key="id"
      class="TInfiniteScroll"
      :class="{smalltable: items.length <10 && items.length > 0,
               infinitescrolltable: items.length > 10,
               tableproducts: rowident === 'productId',
               noscroll: totalItems < tableData.perPage}"
      sticky-header
      show-empty
      responsive
      :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
      :items="items"
      selectable
      selected-variant=""
      :select-mode="selectmode"
      sort-icon-left
      :no-local-sorting="true"
      :sort-by.sync="tableData.sortBy"
      :sort-desc.sync="tableData.sortDesc"
      @row-clicked="onRowClicked"
    >
      <template v-if="totalpages > 1 && tableData.pageNumber !=1" #top-row="{ columns }" class="tablehead-outer">
        <b-th variant="light" :colspan="columns" class="tablehead">
          <span class="scrollcaption"> {{ $t('table.infinit.scrollup') }} </span>
        </b-th>
      </template>
      <template #bottom-row="{ columns }" class="tablefooter-outer">
        <b-th variant="light" :colspan="columns" class="tablefooter">
          <span class="scrollcaption"> {{ $t('table.infinit.scrolldown') }} </span>
        </b-th>
      </template>
      <template #empty>
        --
      </template>
      <template #head()="data">
        <small> <b>{{ data.label }} </b> </small>
      </template>
      <template #head(selected)>
        <small v-if="rowident !== 'productId'"> <b> {{ selection.length }}/{{ totalItems }} </b> </small>
        <ButtonBTNClearSelection v-if="selection.length>0" class="clearselection-btn" :clearselection="clearSelected" />
      </template>
      <template #head(rowactions)>
        <DropdownDDTableColumnVisibilty :table-id="id" :headers="headerData" />
      </template>
      <template #cell(selected)="row">
        <b-icon v-if="selection.includes(row.item[rowident])" :icon="iconnames.tablerowSelected" />
        {{ fixRow(row) }}
      </template>
      <template
        v-for="slotName in Object.keys($scopedSlots)"
        #[slotName]="slotScope"
      >
        <slot :name="slotName" v-bind="slotScope" />
      </template>
    </b-table>

    <BarBTableFooter :pagination="{ tableData: tableData, totalRows:totalItems }" />
    <b-overlay :show="isLoading" no-wrap opacity="0.5" />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { ITableHeaders, ITableData, ITableDataItem, ITableRow } from '../../.utils/types/ttable'
import { Constants } from '../../mixins/uib-mixins'
const cache = namespace('data-cache')

@Component({ mixins: [Constants] })
export default class TInfiniteScroll extends Vue {
  iconnames: any
  $axios: any
  $mq: any
  @Prop({ }) error!: string
  @Prop({ }) isLoading!: boolean
  @Prop({ }) id!: string
  @Prop({ }) rowident!: string
  @Prop({ }) totalpages!: number
  @Prop({ }) totalItems!: number
  @Prop({ }) ismultiselect!: boolean
  @Prop({ default: () => { return [] } }) readonly selection!: Array<string>
  @Prop({ default: () => { return () => { /* default */ } } }) fetchitems!: Function
  @Prop({ default: () => { return () => { /* default */ } } }) setselection!: Function
  @Prop({ default: () => { return () => { /* default */ } } }) routechild!: Function
  @Prop({ default: () => { return () => { /* default */ } } }) headerData!: ITableHeaders
  @Prop({ }) tableData!: ITableData
  @Prop({ }) items!: Array<any>

  @cache.Getter public opsiconfigserver!: string
  get selectmode () {
    if (this.ismultiselect) {
      return 'range'
    } else { return 'single' }
  }

  async fetch () {
    await this.fetchitems()
  }

  mounted () {
    // this.$nextTick(() => {
    const tableScrollBody = (this.$refs[this.id] as any)?.$el
    // const tableScrollBody = (this.$root.$children[2].$refs.LayoutDefaultContent as any)
    tableScrollBody.addEventListener('scroll', this.onScroll)
    // })
  }

  // beforeDestroy () {
  //   const tableScrollBody = (this.$refs[this.id] as any).$el
  //   tableScrollBody.removeEventListener('scroll', this.onScroll)
  // }

  // async previousPage () {
  //   if (!this.isLoading) {
  //     if (this.tableData.pageNumber === 1) {
  //       return
  //     }
  //     this.tableData.pageNumber--
  //     await this.fetchitems()
  //     const tableScrollBody = (this.$refs[this.id] as any).$el
  //     tableScrollBody.scrollTop = 180
  //   }
  // }
  async previousPage () {
    if (!this.isLoading) {
      if (this.tableData.pageNumber === 1) {
        return
      }
      this.tableData.pageNumber--
      await this.fetchitems()
      const tableScrollBody = (this.$refs[this.id] as any).$el
      tableScrollBody.scrollTop = 190
    }
  }

  async nextPage () {
    if (!this.isLoading) {
      if (this.tableData.pageNumber === this.totalpages) {
        return
      }
      this.tableData.pageNumber++
      await this.fetchitems()
      const tableScrollBody = (this.$refs[this.id] as any).$el
      tableScrollBody.scrollTop = 190
    }
  }

  // async firstPage () {
  //   if (!this.isLoading) {
  //     if (this.tableData.pageNumber === 1) {
  //       return
  //     }
  //     this.tableData.pageNumber = 1
  //     await this.fetchitems()
  //     const tableScrollBody = (this.$refs[this.id] as any).$el
  //     tableScrollBody.scrollTop = 180
  //   }
  // }

  // async lastPage () {
  //   if (!this.isLoading) {
  //     if (this.tableData.pageNumber === this.totalpages) {
  //       return
  //     }
  //     this.tableData.pageNumber = this.totalpages
  //     await this.fetchitems()
  //     const tableScrollBody = (this.$refs[this.id] as any).$el
  //     tableScrollBody.scrollTop = 180
  //   }
  // }

  async onScroll (event) {
    // if (this.items.length === 0) {
    //   const tableScrollBody = (this.$refs[this.id] as any).$el
    //   tableScrollBody.removeEventListener('scroll', this.onScroll)
    // } else
    if ( // On Scroll Up
      event.target.scrollTop === 0) {
      await this.previousPage()
    } else if ( // On Scroll Down
      event.target.scrollTop + event.target.clientHeight >=
          event.target.scrollHeight
    ) {
      await this.nextPage()
    }
  }

  fixRow (row: ITableRow): void {
    const rowIdent = row.item[this.rowident] as any
    row.rowSelected = this.selection.includes(rowIdent)
    const elem = document.getElementById(`${this.id}__row_${this.rowident}`)
    if (row.rowSelected) {
      row.item._rowVariant = 'primary'
      if (elem) {
        // elem.setAttribute('aria-selected', 'true')
        elem.classList.add('b-table-row-selected')
      }
    } else {
      row.item._rowVariant = ''
      if (elem) {
        // elem.setAttribute('aria-selected', 'false')
        elem.classList.remove('b-table-row-selected')
      }
    }
  }

  onRowClicked (item:ITableDataItem) {
    const ident = item[this.rowident]
    const selectionCopy:Array<string> = [...this.selection]
    if (this.ismultiselect) {
      if (selectionCopy.includes(ident)) {
        selectionCopy.splice(selectionCopy.indexOf(ident), 1)
      } else {
        selectionCopy.push(ident)
      }
      this.setselection(selectionCopy)
    }
    if (!this.ismultiselect) {
      if (this.rowident === 'productId') {
        this.routechild(ident)
        this.setselection([ident])
      } else if (selectionCopy.includes(ident)) {
        this.setselection([])
      } else {
        this.setselection([ident])
      }
    }
  }

  clearSelected () {
    this.setselection([])
    if (this.rowident === 'depotId') {
      this.setselection([this.opsiconfigserver])
    }
  }
}
</script>

<style>
/* .TInfiniteScroll .b-table-sticky-column{
  z-index: -1;
  position: sticky !important;
} */
.TInfiniteScroll thead > tr > th{
  margin-top: 5px;
  /* border: 1px solid red; */
}
.TInfiniteScroll .clearselection-btn {
  padding: 0px !important;
}
.TInfiniteScroll .table thead th,
.TInfiniteScroll .table thead td {
  padding: 0.40rem;
}
.tablehead {
  padding-top: 200px !important;
  text-align: center;
}
.tablefooter {
  padding-bottom: 200px !important;
  text-align: center;
}
.scrollcaption {
  text-align: center;
  height: 200px;
  margin-top: 200px;
  color: #6c757d;
  font-size: small;
}
.table-responsive {
  max-height: 66vh;
}
/* .infinitescrolltable .b-table-stacked {
  max-height: 66vh;
}
.infinitescrolltable.b-table-sticky-header {
  max-height: 66vh;
}
.tableproducts.b-table-sticky-header {
  max-height: 60vh;
}
.smalltable.b-table-sticky-header {
  max-height: 16vh;
}
.noscroll.b-table-sticky-header {
  max-height: 70vh;
} */
/* .b-table-sticky-header thead > tr:last-child{
  background-color: var(--primary) !important;
} */
</style>
