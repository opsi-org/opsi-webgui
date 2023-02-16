import { Store } from 'vuex'
import { mock, data } from '../../.utils/storybook/mock'

mock.onGet('/api/opsidata/depots/clients?selectedDepots=').reply(200, data.clientIds)
mock.onGet('/api/opsidata/depot_ids').reply(200, data.depotIds)
mock.onGet('/api/opsidata/clients').reply(() => [200, data.clients, { 'x-total-count': data.clients.length }])
mock.onGet('/api/opsidata/products/groups').reply(200, data.groups.products)
mock.onGet('/api/opsidata/products').reply(() => [200, data.products, { 'x-total-count': data.products.length }])
mock.onGet('/api/opsidata/products/count').reply(200, data.products.length)

// Request URL: https://localhost:4447/addons/webgui/api/opsidata/products?type=LocalbootProduct&pageNumber=1&perPage=15&sortBy=productId&sortDesc=false&filterQuery=&selectedDepots=[%22as-tp.uib.local%22]&selectedClients=[%22akunde1.uib.local%22]

export default {
  title: 'View/V Products',
  parameters: { docs: { description: { component: 'Products view with depots, hostgroups and product groups selection' } } },
  store: new Store({
    // component uses store internally like: if ($store.auth.isAuthenticated) { ...doSth... }
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

const PrimaryTemplate = () => ({
  template: '<ViewVProducts/>'
})

// named export Primary to create respective story
export const VProducts = PrimaryTemplate.bind({})
