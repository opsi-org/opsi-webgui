export default {
  title: 'Alert/A AlertAutoDismissible',
  parameters: { docs: { description: { component: 'Auto Dismissible Popup Alert' } } }
}

const DefaultVisibleTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<AlertAAlertAutoDismissible ref="statusAlert" />',
  mounted () {
    const ref = (this.$refs.statusAlert)
    ref.alert('ALERT: ', 'success', 'This is a sample status alert, which dismisses automatically. ')
  }
})

export const AAlertAutoDismissible = DefaultVisibleTemplate.bind({})
