import { mock } from '../../.utils/storybook/mock'

const result = { result: '<config-server-id>' }
mock.onGet('/api/user/opsiserver').reply(200, result)
mock.onPost('/api/auth/login').reply(200, { result: 'Login success' })

export default {
  title: 'Form/F Login',
  parameters: { docs: { description: { component: 'Form for Login' } } }
}

const PrimaryTemplate = () => ({
  template: '<FormFLogin />'
})

// named export Primary to create respective story
export const FLogin = PrimaryTemplate.bind({})
