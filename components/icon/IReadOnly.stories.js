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
    'config-app': {
      namespaced: true,
      getters: {
        config () { return { read_only: true } }
      }
    }
  })
})

export const IReadOnly = PrimaryTemplate.bind({})
