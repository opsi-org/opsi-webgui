import { storiesOf } from '@storybook/vue'
import IOpsiLogo from '~/components/icon/IOpsiLogo'

storiesOf('Icon/opsilogo', module)
  .add('opsilogo', () => ({
    components: { IOpsiLogo },
    parameters: { docs: { description: { component: 'icon/IOpsiLogo description' } } },
    template: '<IconIOpsiLogo/>'
  }))
  // .add('opsilogo2', () => ({
  //   components: { IOpsiLogo },
  //   template: '<IconIOpsiLogo/>'
  // }))
  // .add('I don\'t work', () => '<IconIOpsiLogo />')
