import { argTypeVariants } from '~/.scripts/types/ttestconsts'
// import * from '~/static/themes/opsi-bootstrap-theme-light.css'

// Describe card component
export default {
  title: 'Pages/Index',
  parameters: { docs: { description: { component: 'Pages/Index description' } } },
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

const template = '<PagesIndex v-bind="$props" show> {{$props.content}} </PagesIndex>'
const DefaultVisibleTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template
  // <story/>
})

// named export Primary to create respective story
export const AAlert = DefaultVisibleTemplate.bind({})
