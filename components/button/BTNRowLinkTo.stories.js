// import { argTypeBoolFalse, argTypeTextContent } from '../../.utils/types/ttestconsts'
export default {
  title: 'Button/BTN Row Link To',
  parameters: { docs: { description: { component: 'Button/BTNRowLinkTo description' } } }
}

const PrimaryTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: ` <ButtonBTNRowLinkTo
    :title="$t('title.config')"
    icon="gear"
    to="/products/config"
    :ident="'row.item.productId'"
    :pressed="() => {}"
    :click-parent="() => {}"
  />`
})

export const BTNRowLinkTo = PrimaryTemplate.bind({})
