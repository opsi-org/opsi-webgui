import { argTypeBoolFalse, argTypeTextContent } from '../../.utils/types/ttestconsts'
export default {
  title: 'Button/BTN Open Modal',
  parameters: { docs: { description: { component: 'Button/BTNOpenModal description' } } },
  argTypes: {
    modalId: argTypeTextContent,
    disabled: argTypeBoolFalse
  }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<ButtonBTNOpenModal :modal-id="${args.modalId}||$props.modalId" icon="list-check" :disabled="${args.disabled}||$props.disabled"/>`
})

export const BTNOpenModal = PrimaryTemplate.bind({})
