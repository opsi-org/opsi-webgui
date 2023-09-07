import { Component, Vue } from 'nuxt-property-decorator'
@Component export class Icons extends Vue {
  icon: object = {
    server: 'server',
    client: 'laptop',
    product: 'box-seam',
    group: 'diagram2',
    admin: 'tools',
    support: 'headset',
    settings: 'gear',
    language: 'globe2',
    logout: 'power',
    themelight: 'sun',
    themedark: 'moon',
    trackChanges: 'card-checklist',
    tree: 'list-nested',
    table: 'table',
    navmenu: 'list',
    menu: 'three-dots-vertical',
    quickpanel: 'grid',
    loading: 'three-dots',
    refetch: 'arrow-clockwise',
    reset: 'arrow-counterclockwise',
    exclamation: 'exclamation',
    pencil: 'pencil',
    x: 'x',
    add: 'plus',
    delete: 'trash',
    help: 'question-circle',
    info: 'info-circle',
    download: 'download',
    check: 'check2',
    dash: 'dash',
    valueShow: 'eye-slash',
    valueHide: 'eye',
    arrowRight: 'chevron-right',
    arrowLeft: 'chevron-left',
    arrowUp: 'chevron-up',
    arrowDown: 'chevron-down',
    arrowDoubleUp: 'chevron-double-up',
    arrowDoubleDown: 'chevron-double-down',
    arrowDoubleLeft: 'chevron-double-left',
    arrowDoubleRight: 'chevron-double-right',
    arrowFillUp: 'caret-up',
    arrowFillDown: 'caret-down-fill',
    log: 'file-earmark-text',
    clientReachable: 'link45deg',
    ondemand: 'collection-play',
    message: 'envelope',
    reboot: 'bootstrap-reboot',
    productInstallationStatusUnknown: 'question',
    productActionResult: 'hourglass-bottom',
    productsFailedActionResult: 'exclamation',
    productActionResultSuccessful: 'check',
    productsOutdated: 'cloud-arrow-down',
    sort: 'sort-up',
    sortDesc: 'sort-down',
    columns: 'grid3x3',
    filter: 'funnel',
    clear: 'brush',
    refresh: 'arrow-repeat',
    _stackedIcons: {
      readonly: [
        { icon: 'pencil', scale: '0.55' },
        { icon: 'slash-circle', attr: { 'flip-h': true, variant: 'danger' } }
      ]
    }
  }
}
