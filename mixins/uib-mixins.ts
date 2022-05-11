import Cookie from 'js-cookie'
import { Component, Vue } from 'nuxt-property-decorator'

@Component export class Synchronization extends Vue {
  syncSort (fromSort, toSort, emitToSort, id) {
    if (fromSort.filterQuery && toSort.filterQuery !== fromSort.filterQuery) {
      toSort.filterQuery = fromSort.filterQuery
    }
    if (fromSort.sortBy && toSort.sortBy !== fromSort.sortBy) {
      toSort.sortBy = fromSort.sortBy
      Cookie.set('sorting_' + id, JSON.stringify({ sortBy: toSort.sortBy, sortDesc: toSort.sortDesc }), { expires: 365 })
    }
    if (fromSort.sortDesc !== undefined && toSort.sortDesc !== fromSort.sortDesc) {
      toSort.sortDesc = fromSort.sortDesc
      Cookie.set('sorting_' + id, JSON.stringify({ sortBy: toSort.sortBy, sortDesc: toSort.sortDesc }), { expires: 365 })
    }
    if (emitToSort) { this.$emit('update:sort', toSort) }
  }
}

@Component export class Constants extends Vue {
  // iconnames: any = _icons
  iconnames: any = {
    depot: 'server',
    client: 'laptop',
    // product: 'grid',
    product: 'box-seam',
    changes: 'list-check',
    support: 'headset',
    settings: 'gear',
    settingsobject: 'gear',
    menu: 'three-dots-vertical',
    log: 'file-earmark-text',
    columns: 'grid3x3',
    x: 'x',
    add: 'plus',
    menuOpen: 'list',
    delete: 'trash',
    loading: 'three-dots',
    save: 'check2',
    sort: 'sort-up',
    sortDesc: 'sort-down',
    arrowDoubleDown: 'chevron-double-down',
    arrowDoubleLeft: 'chevron-double-left',
    arrowDoubleRight: 'chevron-double-right',
    arrowFillDown: 'caret-down-fill',
    valueShow: 'eye-slash',
    valueHide: 'eye',
    productInstallationStatus: 'box-seam',
    productInstallationStatusInstalled: 'laptop',
    productInstallationStatusUnknown: 'question',
    productActionResult: 'hourglass-bottom',
    productActionResultSuccessful: 'check',
    productActionResultFailed: 'x',
    productsOutdated: 'cloud-arrow-down',
    productsFailedActionResult: 'x-circle',
    // productsFailedActionResult: 'exclamation-triangle',
    group: 'diagram2',
    reset: 'arrow-counterclockwise',
    refresh: 'arrow-repeat',
    // reset: 'brush',
    clear: 'brush',
    help: 'question-circle',
    info: 'info-circle',
    tablerowSelected: 'check2',
    tablerowNotSelected: 'dash',
    logout: 'power',
    themelight: 'sun',
    themedark: 'moon',
    _stackedIcons:{
      readonly: [
        { icon:'pencil', scale:"0.55"},
        { icon:'slash-circle', attr:{ 'flip-h':true, variant: 'danger' }} // variant/color need also be defined in css of IconIReadOnly
      ]

    }
  }
}
