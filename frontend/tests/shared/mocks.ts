/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { MOCK_DATA_URL } from './constants'
import type { Depot, Client } from './types'
import { getDepots, getClients } from './helpers'

let mockData: any
let serverId: string = ''
let userId: string = ''
let serverObjectList: Depot[] = []
let clientObjectList: Client[] = []

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
    serverObjectList = getDepots(mockData.objects.Host)
    clientObjectList = getClients(mockData.objects.Host)
  } catch (error) {
    console.error('Error fetching mock data:', error)
    throw error
  }
}

export { mockData, serverId, userId, serverObjectList, clientObjectList }
