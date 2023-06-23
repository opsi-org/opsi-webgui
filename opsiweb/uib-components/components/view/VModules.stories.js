import { mock, data } from '../../.utils/storybook/mock'
mock.onGet('/api/opsidata/modulesContent').reply(() => [200, data.modules])

export default {
  title: 'View/V Modules',
  parameters: { docs: { description: { component: 'Modules View' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVModules />'
})

export const VModules = PrimaryTemplate.bind({})
