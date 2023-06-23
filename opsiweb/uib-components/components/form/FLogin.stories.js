import { mock } from '../../.utils/storybook/mock'

const result = { result: '<config-server-id>' }
mock.onGet('/api/user/opsiserver').reply(200, result)
mock.onPost('/api/auth/login').reply(200, { result: 'Login success' })

export default {
  title: 'Form/F Login',
  parameters: { docs: { description: { component: 'Login Form' } } }
}

const PrimaryTemplate = () => ({
  template: '<FormFLogin />'
})

export const FLogin = PrimaryTemplate.bind({})
