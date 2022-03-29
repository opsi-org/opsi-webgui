<template>
  <div>
    <b-navbar class="BPageHeader_Navbar" data-testid="BarBPageHeader" :variant="variant">
      <div class="BPageHeader_Navbar_toggler" @click="toggleCollapse">
        <span v-if="collapseable">
          <b-icon v-if="contentVisible" :icon="iconnames.arrowDoubleDown" />
          <b-icon v-else :icon="iconnames.arrowDoubleRight" />
        </span>

        <slot name="nav-title" v-bind="{ title }">
          <b v-if="title && bold">{{ title }}</b>
          <p v-else-if="title && !bold">
            {{ title }}
          </p>
        </slot>
        <slot name="nav-subtitle" v-bind="{ title }">
          <span v-if="subtitle" class="font-italic" style="margin-left: 5px !important">
            {{ subtitle }}
          </span>
        </slot>
        <div v-if="!collapseable && $mq == 'mobile' && tableInfo" style="display: inline-flex; float: right;">
          <!-- <DropdownDDTableSorting v-if="$mq == 'mobile' && tableInfo" :table-id="id" :table-data="tableInfo.tableData" :headers="tableInfo.headerData" /> -->
          <DropdownDDTableSorting :table-id="id" v-bind.sync="tableInfo" />
          <DropdownDDTableColumnVisibilty :table-id="id" :headers.sync="tableInfo.headerData" :sort-by="tableInfo.sortBy" :multi="true" />
        </div>
      </div>
      <b-navbar-nav class="ml-auto">
        <b-button v-if="redirectOnCloseTo" class="closebtn" variant="transparent" :to="redirectOnCloseTo">
          <span class="sr-only">Close</span>
          <b-icon :icon="iconnames.x" />
        </b-button>
      </b-navbar-nav>
      <b-collapse :id="'collapse-navitem-'+title" v-model="contentVisible" accordion="sidebarAccordion" :visible="contentVisible" class="collapse-navitem container">
        <b-row class="">
          <slot name="nav-child">
            <b-col class="nav-child nav-child-left" col>
              <slot name="nav-child-left">
                <TreeTSDepots v-if="enableDepots" />
                <TreeTSHostGroups v-if="enableClients" />
                <TreeTSProductGroups v-if="enableProducts" />
              </slot>
            </b-col>
            <b-col class="nav-child nav-child-right" cols="*">
              <slot name="nav-child-right">
                <b-col v-if="enableShowChanges" cols="*">
                  <b-button class="changeslink border" variant="link" to="/changes/">
                    {{ $t('button.track.changes') }}
                  </b-button>
                </b-col>
                <b-col v-if="$mq == 'mobile' && tableInfo" cols="*">
                  <DropdownDDTableSorting :table-id="id" v-bind.sync="tableInfo" />
                </b-col>
                <b-col v-if="$mq == 'mobile' && tableInfo" cols="*">
                  <DropdownDDTableColumnVisibilty :table-id="id" :headers.sync="tableInfo.headerData" :sort-by="tableInfo.sortBy" :multi="true" />
                </b-col>
                <!-- <b-col v-if="multiselectToggler != undefined" cols="*">
                  <CheckboxCBMultiselection :multiselect.sync="multiselectToggler" />
                </b-col> -->
                <b-col v-if="enableShowProducts" cols="*">
                  <ButtonBTNRowLinkTo
                    :title="$t('button.show.products')"
                    classes=""
                    :icon="iconnames.product"
                    to="/clients/products"
                    ident="dummy"
                    :pressed="isRouteActive"
                    :click="routeRedirectWith"
                  />
                </b-col>
              </slot>
            </b-col>
          </slot>
        </b-row>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
import { ITableInfo } from '~/.utils/types/ttable'

@Component({ mixins: [Constants] })
export default class BTooltipCollapseRow extends Vue {
  $mq: any
  iconnames: any
  @Prop({ }) id!: string
  @Prop({ }) title!: string
  @Prop({ }) subtitle!: string
  @Prop({ }) value!: string
  @Prop({ }) rowId!: string
  @Prop({ default: 'transparent' }) variant!: string
  @Prop({ default: true }) bold!: boolean
  @Prop({ default: false }) collapseable!: boolean
  @Prop({ default: false }) collapsed!: boolean
  @Prop({ default: false }) enableDepots!: boolean
  @Prop({ default: false }) enableClients!: boolean
  @Prop({ default: false }) enableProducts!: boolean
  @Prop({ default: false }) enableShowProducts!: boolean
  @Prop({ default: false }) enableShowChanges!: boolean
  // @Prop({ default: undefined }) multiselectToggler!: boolean|undefined
  @Prop({ default: undefined }) redirectOnCloseTo!: string
  @Prop({ default: undefined }) redirect!: Function
  @Prop({ default: () => {} }) tableInfo!: ITableInfo

  contentVisible: boolean = false

  // @Watch('multiselectToggler', { deep: true }) multiselectTogglerChanged () {
  //   this.$emit('update:multiselectToggler', this.multiselectToggler)
  // }

  mounted () {
    this.contentVisible = !this.collapsed
  }

  toggleCollapse () {
    if (this.collapseable) {
      this.contentVisible = !this.contentVisible
    }
  }

  routeRedirectWith (to: string, rowIdent: string) {
    this.contentVisible = false
    if (this.redirect) {
      this.redirect(to, rowIdent)
      return
    }
    this.rowId = rowIdent
    this.$router.push(to)
  }

  isRouteActive (to: string, rowIdent: string) {
    return this.$route.path.includes(to) && this.rowId === rowIdent
  }
}
</script>

<style>
.BarBTooltipCollapseRow .nav-link {
  padding-left: 0px;
}
.BPageHeader_Navbar .closebtn {
  max-height: 25px;
}
.BPageHeader_Navbar {
  min-height: 45px;
  padding: 0px !important;
  /* min-height: 45px; */
}
.BPageHeader_Navbar_toggler {
  /* height: 45px; */
  width: calc(100% - 48px);
  /* border: 1px solid green; */
}
.BarBTooltipCollapseRow {
  list-style: none !important;
}
.collapse-navitem > .row{
  width: 100%;
}
.collapse-navitem {
  width: 100%;
  max-width: 100% !important;
  margin-left: 20px !important;
  margin-right: 10px !important;
}
.nav-child-right {
  padding: 0px !important;
  display: flex;
}
.nav-child-right > div{
  margin-left: 5px !important;
}
.nav-child-left > div{
  display: inline-flex;
}
.nav-child-left {
  padding: 0px !important;
  min-width: auto !important;
}
.title-row {
  color: var(--dark);
}
.pageheader{
  height: var(--height-navbar) !important;
}
.pageheader_wrap {
  display: inline-flex;
  flex-wrap: wrap;
}
.navbar {
  z-index: inherit !important;
}
.collapse{
  padding-left: 20px;
}
.nav-item {
  min-width: 100%;
}
</style>
