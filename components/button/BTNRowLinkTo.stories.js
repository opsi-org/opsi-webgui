// import { argTypeBoolFalse, argTypeTextContent } from '../../.utils/types/ttestconsts'
export default {
  title: 'Button/BTN Row Link To',
  parameters: { docs: { description: { component: 'Button/BTNRowLinkTo description' } } }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<b-badge variant="transparent"><ButtonBTNRowLinkTo
    title="title"
    icon="gear"
    to="#"
    :ident="'ident'"
    :pressed="() => {}"
    :click-parent="() => {}"
  /></b-badge>`
})

export const BTNRowLinkTo = PrimaryTemplate.bind({})
