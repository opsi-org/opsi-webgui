<template>
  <b-navbar class="BCollapsePageHeader_Navbar" :class="{collapseable: collapseable}" data-testid="BarBCollapsePageHeader" :variant="variant">
    <div class="BCollapsePageHeader_Navbar_toggler" @click="toggleCollapse">
      <span v-if="collapseable">
        <b-icon v-if="contentVisible" :icon="iconnames.arrowDoubleDown" />
        <b-icon v-else :icon="iconnames.arrowDoubleRight" />
      </span>

      <slot name="nav-title" v-bind="{ title }">
        <b v-if="title && bold" class="nav-title">{{ title }}</b>
        <p v-else-if="title && !bold" class="nav-title">
          {{ title }}
        </p>
      </slot>
      <slot name="nav-subtitle" v-bind="{ title }">
        <span v-if="subtitle" class="font-italic" style="margin-left: 5px !important">
          {{ subtitle }}
        </span>
      </slot>
      <slot />
      <div v-if="!collapseable && $mq == 'mobile' && tableInfo" style="display: inline-flex; float: right;">
        <DropdownDDTableSorting :table-id="id" v-bind.sync="tableInfo" />
        <DropdownDDTableColumnVisibility :table-id="id" :headers.sync="tableInfo.headerData" :sort-by="tableInfo.sortBy" :multi="true" />
        <InputIFilter :data="tableInfo" :additional-title="$t('table.fields.localbootid')" />
      </div>
    </div>
    <b-navbar-nav class="ml-auto">
      <b-button v-if="redirectOnCloseTo" class="closebtn border-0" variant="outline-primary" :to="redirectOnCloseTo">
        <span class="sr-only">{{ $t('button.close') }}</span>
        <b-icon :icon="iconnames.x" />
      </b-button>
    </b-navbar-nav>
    <b-collapse :id="'collapse-navitem-'+title" v-model="contentVisible" accordion="pageHeaderAccordion" :visible="contentVisible" class="collapse-navitem container">
      <b-row class="">
        <slot name="nav-child">
          <b-col class="nav-child nav-child-left y">
            <slot name="nav-child-left">
              <TreeTSDepots v-if="enableDepots" />
              <TreeTSHostGroups v-if="enableClients" />
              <TreeTSProductGroups v-if="enableProducts" />
            </slot>
          </b-col>
          <b-col class="nav-child nav-child-right" cols="*">
            <slot name="nav-child-right">
              <b-col v-if="$mq == 'mobile' && tableInfo" cols="*">
                <InputIFilter :data="tableInfo" :additional-title="$t('table.fields.localbootid')" />
              </b-col>
              <b-col v-if="$mq == 'mobile' && tableInfo" cols="*">
                <DropdownDDTableSorting :table-id="id" v-bind.sync="tableInfo" />
              </b-col>
              <b-col v-if="$mq == 'mobile' && tableInfo" cols="*">
                <DropdownDDTableColumnVisibility :table-id="id" :headers.sync="tableInfo.headerData" :sort-by="tableInfo.sortBy" :multi="true" />
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
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
import { ITableInfo } from '../../.utils/types/ttable'

@Component({ mixins: [Constants] })
export default class BTooltipCollapseRow extends Vue {
  $mq: any
  iconnames: any
  @Prop({ }) id!: string
  @Prop({ }) title!: string
  @Prop({ }) subtitle!: string
  @Prop({ }) value!: string
  @Prop({ }) rowId!: string
  @Prop({ default: '' }) variant!: string
  @Prop({ default: true }) bold!: boolean
  @Prop({ default: false }) collapseable!: boolean
  @Prop({ default: false }) collapsed!: boolean
  @Prop({ default: false }) enableDepots!: boolean
  @Prop({ default: false }) enableClients!: boolean
  @Prop({ default: false }) enableProducts!: boolean
  @Prop({ default: false }) enableShowProducts!: boolean
  // @Prop({ default: undefined }) multiselectToggler!: boolean|undefined
  @Prop({ default: undefined }) redirectOnCloseTo!: string
  @Prop({ default: undefined }) redirect!: Function
  @Prop({ default: () => {} }) tableInfo!: ITableInfo

  contentVisible: boolean = false

  @Watch('collapsed', { deep: true }) multiselectTogglerChanged () {
    this.contentVisible = !this.collapsed
  }

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
/* .BCollapsePageHeader_Navbar.collapseable {
  cursor: pointer;
} */
.BCollapsePageHeader_Navbar.navbar {
  z-index: inherit !important;
  background-image: none !important;
  background: inherit !important;
}
.BCollapsePageHeader_Navbar.navbar-expand {
  flex-flow: row wrap;
}
.BCollapsePageHeader_Navbar {
  background-color: inherit !important;
  color: inherit !important;
  background-image: none !important;
  padding: 5px 0px !important;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
  min-height: 45px;
  padding: 0px !important;
}
.BCollapsePageHeader_Navbar .dropdown {
  margin: 0px !important;
}
.BarBTooltipCollapseRow .nav-link {
  padding-left: 0px;
}

.BCollapsePageHeader_Navbar .closebtn {
  max-height: 25px;
}

.BCollapsePageHeader_Navbar_toggler {
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 10px;
  width: calc(100% - 48px);
  cursor: pointer;
}
.BarBTooltipCollapseRow {
  list-style: none !important;
}
.BCollapsePageHeader_Navbar .collapse-navitem > .row{
  width: 100%;
}
.BCollapsePageHeader_Navbar .collapse-navitem {
  width: 100%;
  min-width: 100% !important;
  max-width: 100% !important;
  margin-left: 20px !important;
  margin-right: 20px !important;
  /* cursor: default; */
}
.BCollapsePageHeader_Navbar .nav-child-right {
  padding: 0px !important;
  display: flex;
}
.BCollapsePageHeader_Navbar .nav-child-right > div{
  margin-left: 5px !important;
}
.BCollapsePageHeader_Navbar .nav-child-left > div{
  display: inline-flex;
}
.BCollapsePageHeader_Navbar .row,
.BCollapsePageHeader_Navbar .row > * {
  width: auto;
  /* display: flex; */
}

.BCollapsePageHeader_Navbar .nav-child-left {
  padding: 0px !important;
  min-width: auto !important;
  width: calc(100% - 50px) !important;
  display: block;
}
.BCollapsePageHeader_Navbar .title-row {
  color: var(--dark);
}
.BCollapsePageHeader_Navbar .pageheader{
  height: var(--height-navbar) !important;
}
.BCollapsePageHeader_Navbar .pageheader_wrap {
  display: inline-flex;
  flex-wrap: wrap;
}
</style>
