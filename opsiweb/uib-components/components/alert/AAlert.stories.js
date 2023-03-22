// import { argTypeVariants } from '../../.utils/types/ttestconsts'
// import * from '~/static/themes/opsi-bootstrap-theme-light.css'

// Describe card component
export default {
  title: 'Alert/A Alert',
  parameters: { docs: { description: { component: 'Alert/AAlert description' } } }
}

const DefaultVisibleTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<AlertAAlert v-bind="$props" ref="refAlert" />',
  mounted () {
    const ref = (this.$refs.refAlert)
    ref.alert('errorMsg', 'danger', 'errorDetails')
  }
})

// named export Primary to create respective story
export const AAlert = DefaultVisibleTemplate.bind({})
