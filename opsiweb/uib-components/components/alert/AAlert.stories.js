export default {
  title: 'Alert/A Alert',
  parameters: { docs: { description: { component: 'Popup Alert' } } }
}

const DefaultVisibleTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<AlertAAlert v-bind="$props" ref="refAlert" />',
  mounted () {
    const ref = (this.$refs.refAlert)
    ref.alert('errorMsg', 'danger', 'errorDetails')
  }
})

export const AAlert = DefaultVisibleTemplate.bind({})
