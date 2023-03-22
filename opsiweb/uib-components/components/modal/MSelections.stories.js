export default {
  title: 'Modal/M Selections',
  parameters: { docs: { description: { component: 'Modal for showing selections' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ModalMSelections v-bind="args" />'
})

export const MSelections = PrimaryTemplate.bind({})
MSelections.args = {
  id: 'id',
  selections: ['client1.domain.local', 'client2.domain.local', 'client3.domain.local'],
  type: 'sampleType',
  variant: 'dark'
}
