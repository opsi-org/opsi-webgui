export default {
  title: 'Tabs/T Quick Selections',
  parameters: { docs: { description: { component: 'Tabs for quick selections' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<TabsTQuickSelections />'
})

export const TQuickSelections = PrimaryTemplate.bind({})
