import { Store } from 'vuex'
import { mock, data } from '../../.utils/storybook/mock'
mock.onGet('/api/opsidata/depots/clients?selectedDepots=').reply(200, data.clientIds)
mock.onGet('/api/opsidata/depot_ids').reply(200, data.depotIds)
mock.onGet('/api/opsidata/clients').reply(() => [200, data.clients, { 'x-total-count': data.clients.length }])
mock.onGet('/api/opsidata/products/groups').reply(200, data.groups.products)
mock.onGet('/api/opsidata/products').reply(() => [200, data.products, { 'x-total-count': data.products.length }])
mock.onGet('/api/opsidata/products/count').reply(200, data.products.length)

export default {
  title: 'View/V Products',
  parameters: { docs: { description: { component: 'Products view' } } },
  store: new Store({
    modules: {
      selections: {
        namespaced: true,
        getters: {
          selectionDepots () { return ['depot1.uib.local'] },
          selectionClients () { return ['client1.uib.local'] }
        }
      }
    }
  })
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ViewVProducts v-bind="args" />'
})

export const VProducts = PrimaryTemplate.bind({})
VProducts.args = {
  tableloaded: true,
  child: false,
  id: 'products'
}
