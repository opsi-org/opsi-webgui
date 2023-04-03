export default {
  title: 'Tablecell/T C Installation Status',
  parameters: { docs: { description: { component: 'Table cell for installation status' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<TableCellTCInstallationStatus v-bind="args" />'
})

export const TCInstallationStatusUnknown = PrimaryTemplate.bind({})
TCInstallationStatusUnknown.args = {
  text: '≠',
  variant: 'warning'
}

export const TCInstallationStatusInstalled = PrimaryTemplate.bind({})
TCInstallationStatusInstalled.args = {
  text: '≠',
  variant: 'success'
}

export const TCInstallationStatusDanger = PrimaryTemplate.bind({})
TCInstallationStatusDanger.args = {
  text: '≠',
  variant: 'danger'
}
