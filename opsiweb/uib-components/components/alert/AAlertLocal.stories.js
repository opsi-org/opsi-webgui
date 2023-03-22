// import { argTypeVariants } from '../../.utils/types/ttestconsts'
// import * from '~/static/themes/opsi-bootstrap-theme-light.css'

// Describe card component
export default {
  title: 'Alert/A Alert Local',
  parameters: { docs: { description: { component: 'Alert/AAlertLocal description' } } }
}

const DefaultVisibleTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<AlertAAlertLocal show variant="warning">
    content
  </AlertAAlertLocal>
`
})

// named export Primary to create respective story
export const AAlertLocal = DefaultVisibleTemplate.bind({})
