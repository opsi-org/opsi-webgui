// import { mock, data } from '../../.utils/storybook/mock'
// mock.onGet('/api/opsidata/depots/products?selectedDepots=').reply(200, data.netbootproductIds)
export default {
  title: 'View/V Client Creation',
  parameters: { docs: { description: { component: 'New opsi client creation view' } } }
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: '<ViewVClientCreation v-bind="args" />'
})

export const VClientCreation = PrimaryTemplate.bind({})
// VClientCreation.args = {
//   netbootproductslist: data.netbootproductIds
// }
