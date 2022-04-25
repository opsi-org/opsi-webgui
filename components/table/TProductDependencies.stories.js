export default {
  title: 'Table/T Product Dependencies',
  parameters: { docs: { description: { component: 'Table for Product Dependencies' } } }
}

const dependencies = {
  dependencies: [{ productId: 'productId1', productAction: 'setup', version: '4.1.1.14-3', requiredProductId: 'l-system-update', requiredVersion: null, requiredAction: 'setup', requiredInstallationStatus: null, requirementType: 'before' }],
  productVersions: { clientId1: '4.1.1.14-3' },
  productDescriptionDetails: { clientId1: 'Installs opsi-server packages, configures and create adminuser' },
  productDescription: 'Installs opsi-server packages, configures and create adminuser'
}

const PrimaryTemplate = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  computed: { args () { return args } },
  template: `<TableTProductDependencies :id="args.id" :dependencies="args.deps"/>
  `
})

// named export Primary to create respective story
export const TProductDependencies = PrimaryTemplate.bind({})

TProductDependencies.args = {
  id: 'id',
  deps: dependencies
}
