// import { argTypeBoolFalse, argTypeTextContent } from '../../.utils/types/ttestconsts'
export default {
  title: 'Checkbox/CB Multiselection',
  parameters: { docs: { description: { component: 'Checkbox/CBMultiselection description' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<CheckboxCBMultiselection :multiselect.sync="args.multiselect" />'
})

export const CBMultiselection = PrimaryTemplate.bind({})
CBMultiselection.args = { multiselect: true }
