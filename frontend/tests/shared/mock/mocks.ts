/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { MOCK_DATA_URL } from '../constants'
import type { Depot, Client } from './types'
import {
  getDepots,
  getClients,
  getClientsList,
  getProducts,
  getHostGroups,
} from './helpers'

let mockData: any
let serverId: string = ''
let userId: string = ''
let userConfig: any = {}
let serverObjectList: Depot[] = []
let clientObjectList: Client[] = []
let clientList: string[] = []
let productObjectList: any = []
let hostGroups: any = []

export const fetchMockData = async (): Promise<void> => {
  if (mockData) return

  try {
    const response = await fetch(MOCK_DATA_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch mock data: ${response.statusText}`)
    }

    mockData = await response.json()
    serverId = mockData.meta.server_id
    userId = mockData.objects.User[0].id
    userConfig = { user: userId, configuration: mockData.config_files }
    serverObjectList = getDepots(mockData.objects.Host)
    clientObjectList = getClients(mockData.objects.Host)
    clientList = getClientsList(mockData.objects.Host)
    productObjectList = getProducts(mockData.objects.Product)
    hostGroups = getHostGroups(mockData.objects.Group)
  } catch (error) {
    console.error('Error fetching mock data:', error)
    throw error
  }
}

export {
  mockData,
  serverId,
  userId,
  userConfig,
  serverObjectList,
  clientObjectList,
  clientList,
  productObjectList,
  hostGroups,
}
