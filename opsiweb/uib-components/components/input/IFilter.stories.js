import { data } from '../../.utils/storybook/mock'

export default {
  title: 'Input/I Filter',
  parameters: { docs: { description: { component: 'Input for filter' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<InputIFilter :data="args.tableInfo" :additional-title="args.title" />'
})

export const IFilter = PrimaryTemplate.bind({})
IFilter.args = {
  title: 'title',
  tableInfo: data.tableInfo
}
