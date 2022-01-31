
import { mock } from '../../.utils/storybook/mock'

const result = [
  {
    productId: 'activate-win',
    name: 'Windows Activation',
    description: 'Tries to activate this Windows installation',
    selectedDepots: ['as-tp.uib.local'],
    selectedClients: null,
    installationStatus: 'not_installed',
    actionRequest: null,
    actionProgress: null,
    actionResult: null,
    clientVersions: null,
    client_version_outdated: false,
    actions: ['setup', 'none'],
    depot_version_diff: false,
    depotVersions: ['1.0-9'],
    productType: 'LocalbootProduct',
    selected: 0
  },
  {
    productId: 'config-win-base',
    name: 'Windows Customizing',
    description: 'Anpassung von Windows XP / Vista / Win7 Einstellungen',
    selectedDepots: ['as-tp.uib.local'],
    selectedClients: null,
    installationStatus: 'not_installed',
    actionRequest: null,
    actionProgress: null,
    actionResult: null,
    clientVersions: null,
    client_version_outdated: false,
    actions: ['setup', 'none'],
    depot_version_diff: false,
    depotVersions: ['4.0.1-1'],
    productType: 'LocalbootProduct',
    selected: 0
  },
  {
    productId: 'config-win10',
    name: 'Configure Windows 10',
    description:
      'Configure various Windows 10 settings like lockscreen, hibernationboot, telemetry sending and update behavior.',
    selectedDepots: ['as-tp.uib.local'],
    selectedClients: null,
    installationStatus: 'not_installed',
    actionRequest: null,
    actionProgress: null,
    actionResult: null,
    clientVersions: null,
    client_version_outdated: false,
    actions: ['setup', 'none'],
    depot_version_diff: false,
    depotVersions: ['4.1.1-9'],
    productType: 'LocalbootProduct',
    selected: 0
  }
]

mock.onGet('/api/opsidata/products').reply(200, result, { 'x-total-count': result.length })

export default {
  title: 'Table/T Products Localboot',
  parameters: { docs: { description: { component: 'Table for ProductsLocalboot' } } }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<TableTProductsLocalboot  v-bind="$props"></TableTProductsLocalboot>'
  // template: `<TableTProductsLocalboot
  //   :rowident="$props.rowident"
  //   :routeRedirectWith="$props.routeRedirectWith"
  //   :multiselect="$props.multiselect"
  //   :child="$props.child"
  //   :sortBy="$props.sortBy"
  // />
  // `
})

// named export Primary to create respective story
export const TProductsLocalbootSingle = PrimaryTemplate.bind({})
TProductsLocalbootSingle.args = {
  rowident: '',
  routeRedirectWith: () => {},
  multiselect: false,
  child: false,
  sortby: 'productId'
}

export const TProductsLocalbootMulti = PrimaryTemplate.bind({})
TProductsLocalbootMulti.args = {
  rowident: '',
  routeRedirectWith: () => {},
  multiselect: true,
  child: false,
  sortby: 'productId'

}
