// import { argTypeBoolFalse, argTypeTextContent } from '../../.utils/types/ttestconsts'
export default {
  title: 'Button/BTN Row Link To',
  parameters: { docs: { description: { component: 'Table row button for page navigation' } } }
}

const PrimaryTemplateConfig = (_args, { argTypes }) => ({
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

const PrimaryTemplateLog = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<b-badge variant="transparent"><ButtonBTNRowLinkTo
    title="title"
    icon="file-earmark-text"
    to="#"
    :ident="'ident'"
    :pressed="() => {}"
    :click-parent="() => {}"
  /></b-badge>`
})

const PrimaryTemplateProducts = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<b-badge variant="transparent"><ButtonBTNRowLinkTo
    title="title"
    label="Products"
    icon="box-seam"
    to="#"
    :ident="'ident'"
    :pressed="() => {}"
    :click-parent="() => {}"
  /></b-badge>`
})

export const BTNRowLinkToConfig = PrimaryTemplateConfig.bind({})
export const BTNRowLinkToLog = PrimaryTemplateLog.bind({})
export const BTNRowLinkToProducts = PrimaryTemplateProducts.bind({})
