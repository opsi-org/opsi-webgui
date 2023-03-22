import { mock, data, customstores } from '../../.utils/storybook/mock'
mock.onGet('/api/opsidata/depots').reply(() => [200, data.depots, { 'x-total-count': data.depots.length }])

export default {
  title: 'View/V Depots',
  parameters: { docs: { description: { component: 'Depots View' } } }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<ViewVDepots />',
  store: customstores({
    'data-cache': {
      namespaced: true,
      getters:
        { opsiconfigserver () { return ['<config-server-id>'] } } // getters
    },
    selections: {
      namespaced: true,
      getters: {
        selectionClients () { return [] },
        selectionDepots () { return ['<config-server-id>'] }
      }
    }
  })
})

// named export Primary to create respective story
export const VDepots = PrimaryTemplate.bind({})
