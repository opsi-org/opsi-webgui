import { mock, data } from '../../.utils/storybook/mock'
mock.onGet('/api/opsidata/hosts?hosts=foo').reply(200, data.config.client)

export default {
  title: 'View/V Config',
  parameters: { docs: { description: { component: 'Host Attributes View' } } }
}

const PrimaryTemplate = () => ({
  template: '<ViewVConfig id="foo" />'
})

// named export Primary to create respective story
export const VConfig = PrimaryTemplate.bind({})
