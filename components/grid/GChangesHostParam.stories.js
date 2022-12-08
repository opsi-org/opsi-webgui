import { customstores } from '../../.utils/storybook/mock'

export default {
  title: 'Grid/G Changes Host Param',
  parameters: { docs: { description: { component: 'Grid for Host param Changes' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<GridGChangesHostParam />',
  store: customstores({
    auth: {
      namespaced: true,
      getters:
        { username () { return 'testuser' } }
    },
    changes: {
      namespaced: true,
      getters: {
        changesHostParam () {
          return [
            { user: 'testuser', hostId: 'client1.domain.local', type: 'clients', configId: 'configId1', value: 'true' },
            { user: 'testuser', hostId: 'client2.domain.local', type: 'clients', configId: 'configId2', value: 'value1' },
            { user: 'testuser', hostId: 'depot1.domain.local', type: 'depots', configId: 'configId3', value: ['value1', 'value2'] }
          ]
        }
      }
    }
  })
})

export const GChangesHostParam = PrimaryTemplate.bind({})
