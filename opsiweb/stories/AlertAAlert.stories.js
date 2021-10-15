import { argTypeVariants } from '~/scripts/types/ttestconsts'
// import * from '~/static/themes/opsi-bootstrap-theme-light.css'

// Describe card component
export default {
  title: 'Alert/A Alert',
  parameters: { docs: { description: { component: 'Alert/AAlert description' } } },
  argTypes: {
    variant: argTypeVariants,
    content: {
      defaultValue: 'Content text',
      control: {
        type: 'text'
      }
    }
  }
}

const DefaultVisibleTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<AlertAAlert v-bind="$props" show> {{$props.content}} </AlertAAlert>'
})

// named export Primary to create respective story
export const AAlert = DefaultVisibleTemplate.bind({})
