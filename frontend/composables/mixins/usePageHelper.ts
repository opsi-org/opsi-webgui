export interface PageSettings {
  page0Condition: boolean
  page1Condition: boolean
  width: undefined | string
}

export const usePageHelper = () => {
  const path = computed(() =>
    useRoute()
      .path.split('/')
      .filter((p: string) => p !== ''),
  )

  const serverSettings: Record<string, PageSettings> = {
    servers: {
      page0Condition: true,
      page1Condition: false,
      width: '100%',
    },
    'servers-config': {
      page0Condition: false,
      page1Condition: true,
      width: '100%',
    },
    'servers-config-id': {
      page0Condition: false,
      page1Condition: true,
      width: '100%',
    },
    'servers-server-pagetype-id': {
      page0Condition: true,
      page1Condition: true,
      width: '50%',
    },
  }

  const clientSettings: Record<string, PageSettings> = {
    clients: {
      page0Condition: true,
      page1Condition: false,
      width: '100%',
    },
    'clients-config': {
      page0Condition: false,
      page1Condition: true,
      width: '100%',
    },
    'clients-config-id': {
      page0Condition: false,
      page1Condition: true,
      width: '100%',
    },
    'clients-create': {
      page0Condition: false,
      page1Condition: true,
      width: '100%',
    },
    'clients-clone': {
      page0Condition: false,
      page1Condition: true,
      width: '100%',
    },
    'clients-logs-id': {
      page0Condition: false,
      page1Condition: true,
      width: '100%',
    },
    'clients-clone-id': {
      page0Condition: false,
      page1Condition: true,
      width: '100%',
    },
    'clients-client-pagetype-id': {
      page0Condition: true,
      page1Condition: true,
      width: '50%',
    },
    'clients-products-producttype': {
      page0Condition: true,
      page1Condition: true,
      width: undefined,
    },
    'clients-products-producttype-pagetype-id': {
      page0Condition: true,
      page1Condition: true,
      width: undefined,
    },
  }

  const productSettings: Record<string, PageSettings> = {
    'products-producttype': {
      page0Condition: true,
      page1Condition: false,
      width: '100%',
    },
    'products-producttype-pagetype-id': {
      page0Condition: true,
      page1Condition: true,
      width: '50%',
    },
  }
  return { serverSettings, clientSettings, productSettings, path }
}
