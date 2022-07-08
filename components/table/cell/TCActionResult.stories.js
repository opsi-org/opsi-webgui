export default {
  title: 'Tablecell/T C Actionresult',
  parameters: { docs: { description: { component: 'Table cell for actionResult' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<TableCellTCActionResult v-bind="args" />'
})

// named export Primary to create respective story
export const TCActionResult = PrimaryTemplate.bind({})
TCActionResult.args = {
  text: 'sample text'
}
