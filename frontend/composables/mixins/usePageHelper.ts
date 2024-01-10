
export const usePageHelper = () => {
  const route = useRoute()
  const path = computed(()=> route.path.split('/').filter((p: string)=> p !== ''))

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
  // clientSettings['clients-products-type-id'] = {
  //   page0Condition: true,
  //   page1Condition: true,
  //   width: undefined
  // }

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
  return { clientSettings, productSettings, path }
}
