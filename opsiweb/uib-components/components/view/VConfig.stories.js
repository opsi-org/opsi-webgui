import { mock, customstores, data } from '../../.utils/storybook/mock'
mock.onGet('/api/opsidata/hosts?hosts=foo').reply(200, data.config.client)

export default {
  title: 'View/V Config',
  parameters: { docs: { description: { component: 'Host Attributes View' } } }
}

const PrimaryTemplateClient = () => ({
  template: '<ViewVConfig id="foo" type="clients" />',
  store: customstores({
    'config-app': {
      namespaced: true,
      getters: {
        config () { return false }
      }
    }
  })
})

// const PrimaryTemplateServer = () => ({
//   template: '<ViewVConfig id="<config-server-id>" type="depots" />',
//   store: customstores({
//     'config-app': {
//       namespaced: true,
//       getters: {
//         config () { return false }
//       }
//     }
//   })
// })

// named export Primary to create respective story
export const VConfigClients = PrimaryTemplateClient.bind({})
// export const VConfigServer = PrimaryTemplateServer.bind({})
