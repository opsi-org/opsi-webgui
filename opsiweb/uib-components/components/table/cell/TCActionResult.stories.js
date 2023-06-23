export default {
  title: 'Tablecell/T C Action Result',
  parameters: { docs: { description: { component: 'Table cell for actionResult' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<TableCellTCActionResult v-bind="args" />'
})

export const TCActionResultUnknown = PrimaryTemplate.bind({})
TCActionResultUnknown.args = {
  text: 'unknown',
  variant: 'warning'
}

export const TCActionResultInstalled = PrimaryTemplate.bind({})
TCActionResultInstalled.args = {
  text: 'installed',
  variant: 'success'
}

export const TCActionResultSuccess = PrimaryTemplate.bind({})
TCActionResultSuccess.args = {
  text: 'successful',
  variant: 'success'
}

export const TCActionResultFailed = PrimaryTemplate.bind({})
TCActionResultFailed.args = {
  text: 'failed',
  variant: 'danger'
}
