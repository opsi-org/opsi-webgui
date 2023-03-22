import { customstores } from '../../.utils/storybook/mock'
export default {
  title: 'Modal/M Selections All',
  parameters: { docs: { description: { component: 'Modal for showing all selections together' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ModalMSelectionsAll />',
  store: customstores({
    selections: {
      namespaced: true,
      getters: {
        selectionClients () { return ['client1.domain.local', 'client2.domain.local', 'client3.domain.local'] },
        selectionDepots () { return ['depot1.domain.local', 'depot2.domain.local'] }
      }
    }
  })
})

export const MSelectionsAll = PrimaryTemplate.bind({})
