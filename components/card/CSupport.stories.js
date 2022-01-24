import { argTypeTextContent, argTypeTextTitle } from '../../.utils/types/ttestconsts'

// import { argTypeBoolFalse, argTypeTextContent } from '../../.utils/types/ttestconsts'
export default {
  title: 'Card/C Support',
  parameters: { docs: { description: { component: 'Card/CardCSupport description' } } },
  argTypes: {
    // hide: { action: 'clicked' },
    title: argTypeTextTitle,
    content: argTypeTextContent,
    buttonname: argTypeTextContent
  }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<CardCSupport
  :item="{title:'${args.title}'||$props.title, description:'${args.content}'||$props.content, link:'.', buttonname:'${args.buttonname}'||$props.buttonname}"
  />`
  // :item="{title:'title', description:'desc', link:'.', buttonname:'buttonname'}"
  // :item="{ title: 'props.title', description: 'props.content', link:'.', buttonname:'props.buttonname'}"
})

export const CSupport = PrimaryTemplate.bind({})
CSupport.args = {
  title: 'Card title',
  content: 'This is the description of the card. It can be a longer test. Thats because its the description. It can be a longer test. Thats because its the description. It can be a longer test. Thats because its the description. It can be a longer test. Thats because its the description. It can be a longer test. Thats because its the description.',
  buttonname: 'Action Button'
}
