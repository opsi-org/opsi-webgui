import { customstores } from '../../.utils/storybook/mock'
export default {
  title: 'Icon/I Read Only',
  parameters: { docs: { description: { component: 'Icon for showing user Read Only status' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<IconIReadOnly />',
  store: customstores({
    'config-app': {
      namespaced: true,
      getters: {
        config () { return { read_only: true } }
      }
    }
  })
})

export const IReadOnly = PrimaryTemplate.bind({})
