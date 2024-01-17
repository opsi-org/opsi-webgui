
export const usePageHelper = () => {
  const path = computed(()=> useRoute().path.split('/').filter((p: string)=> p !== ''))

  const serverSettings = {}
  serverSettings['servers'] = {
    page0Condition: true,
    page1Condition: false,
    width: '100%'
  }
  serverSettings['servers-config'] = {
    page0Condition: false,
    page1Condition: true,
    width: '100%'
  }
  serverSettings['servers-config-id'] = {
    page0Condition: false,
    page1Condition: true,
    width: '100%'
  }
  serverSettings['servers-server-pagetype-id'] = {
    page0Condition: true,
    page1Condition: true,
    width: '50%'
  }


  const clientSettings = {}
  clientSettings['clients'] = {
    page0Condition: true,
    page1Condition: false,
    width: '100%'
  }
  clientSettings['clients-config'] = {
    page0Condition: false,
    page1Condition: true,
    width: '100%'
  }
  clientSettings['clients-config-id'] = {
    page0Condition: false,
    page1Condition: true,
    width: '100%'
  }
  clientSettings['clients-logs-id'] = {
    page0Condition: false,
    page1Condition: true,
    width: '100%'
  }
  clientSettings['clients-client-pagetype-id'] = {
    page0Condition: true,
    page1Condition: true,
    width: '50%'
  }
  clientSettings['clients-products-producttype'] = {
    page0Condition: true,
    page1Condition: true,
    width: undefined
  }
  clientSettings['clients-products-producttype-pagetype-id'] = {
    page0Condition: true,
    page1Condition: true,
    width: undefined
  }


  const productSettings = {}
  productSettings['products-producttype'] = {
    page0Condition: true,
    page1Condition: false,
    width: '100%'
  }
  productSettings['products-producttype-pagetype-id'] = {
    page0Condition: true,
    page1Condition: true,
    width: '50%'
  }
  return { serverSettings, clientSettings, productSettings, path }
}
