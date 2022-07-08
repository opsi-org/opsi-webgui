export default {
  title: 'Tablecell/T C Installationstatus',
  parameters: { docs: { description: { component: 'Table cell for installation status' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<TableCellTCInstallationStatus v-bind="args" />'
})

// named export Primary to create respective story
export const TCInstallationStatus = PrimaryTemplate.bind({})
TCInstallationStatus.args = {
  text: 'sample installation status'
}
