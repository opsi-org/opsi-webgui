export default {
  title: 'Grid/G Product Dependencies',
  parameters: { docs: { description: { component: 'Grid for Product Dependencies' } } }
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
  template: `<GridGProductDependencies :id="args.id" :dependencies="args.deps"/>
  `
})

export const GProductDependencies = PrimaryTemplate.bind({})
GProductDependencies.args = {
  id: 'id',
  deps: dependencies
}
