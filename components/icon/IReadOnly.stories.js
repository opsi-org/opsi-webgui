import { customstores } from '../../.utils/storybook/mock'
export default {
  title: 'Icon/I Read Only',
  parameters: { docs: { description: { component: 'Read Only Icon' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<IconIReadOnly />',
  store: customstores({
    config: {
      namespaced: true,
      getters: {
        readonly () { return true }
      }
    }
  })
})

export const IReadOnly = PrimaryTemplate.bind({})
