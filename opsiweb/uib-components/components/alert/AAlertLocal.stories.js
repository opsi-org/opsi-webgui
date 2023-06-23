export default {
  title: 'Alert/A Alert Local',
  parameters: { docs: { description: { component: 'Non popup undismissible Alert' } } }
}

const DefaultVisibleTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<AlertAAlertLocal show variant="warning">
    content
  </AlertAAlertLocal>
`
})

export const AAlertLocal = DefaultVisibleTemplate.bind({})
