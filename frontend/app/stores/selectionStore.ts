/**
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * Central Pinia store for managing ALL selections across the application.
 * This is the SINGLE source of truth for depots, clients, and products selections.
 * Used by tables, quick panel, and group tree.
 * Replaces the legacy selectionsStore pattern.
 */
import { defineStore } from 'pinia'

export interface SelectionStoreState {
	// Selections
	selectedDepots: string[]
	selectedClients: string[]
	selectedProducts: string[]
	selectedClientGroups: string[]
	selectedProductGroups: string[]

	// Source tracking (where the selection came from)
	selectionSource: 'table' | 'quickpanel' | 'groups' | null
}

export const useSelectionStore = defineStore('selection', {
	persist: { key: 'opsi-webgui-selection', storage: localStorage },
	state: (): SelectionStoreState => ({
		selectedDepots: [],
		selectedClients: [],
		selectedProducts: [],
		selectedClientGroups: [],
		selectedProductGroups: [],
		selectionSource: null,
	}),

	getters: {
		depotCount: (state) => state.selectedDepots.length,
		clientCount: (state) => state.selectedClients.length,
		productCount: (state) => state.selectedProducts.length,
		hasAnySelection: (state) =>
			state.selectedDepots.length > 0 ||
			state.selectedClients.length > 0 ||
			state.selectedProducts.length > 0 ||
			state.selectedClientGroups.length > 0 ||
			state.selectedProductGroups.length > 0,
		/** Formatted depot list for API calls: [depot1,depot2] */
		selectedDepotsParam: (state): string => `[${state.selectedDepots.join(',')}]`,
	},

	actions: {
		// Depot selections
		setDepots(depots: string[], source: SelectionStoreState['selectionSource'] = 'table') {
			this.selectedDepots = depots
			this.selectionSource = source
		},
		toggleDepot(depotId: string, source: SelectionStoreState['selectionSource'] = 'table') {
			const index = this.selectedDepots.indexOf(depotId)
			if (index > -1) {
				this.selectedDepots.splice(index, 1)
			} else {
				this.selectedDepots.push(depotId)
			}
			this.selectionSource = source
		},
		clearDepots() {
			this.selectedDepots = []
		},

		// Client selections
		setClients(clients: string[], source: SelectionStoreState['selectionSource'] = 'table') {
			this.selectedClients = clients
			this.selectionSource = source
		},
		toggleClient(clientId: string, source: SelectionStoreState['selectionSource'] = 'table') {
			const index = this.selectedClients.indexOf(clientId)
			if (index > -1) {
				this.selectedClients.splice(index, 1)
			} else {
				this.selectedClients.push(clientId)
			}
			this.selectionSource = source
		},
		clearClients() {
			this.selectedClients = []
		},

		// Product selections
		setProducts(products: string[], source: SelectionStoreState['selectionSource'] = 'table') {
			this.selectedProducts = products
			this.selectionSource = source
		},
		toggleProduct(productId: string, source: SelectionStoreState['selectionSource'] = 'table') {
			const index = this.selectedProducts.indexOf(productId)
			if (index > -1) {
				this.selectedProducts.splice(index, 1)
			} else {
				this.selectedProducts.push(productId)
			}
			this.selectionSource = source
		},
		clearProducts() {
			this.selectedProducts = []
		},

		// Group selections
		setClientGroups(groups: string[]) {
			this.selectedClientGroups = groups
		},
		toggleClientGroup(groupId: string) {
			const index = this.selectedClientGroups.indexOf(groupId)
			if (index > -1) {
				this.selectedClientGroups.splice(index, 1)
			} else {
				this.selectedClientGroups.push(groupId)
			}
		},
		clearClientGroups() {
			this.selectedClientGroups = []
		},

		setProductGroups(groups: string[]) {
			this.selectedProductGroups = groups
		},
		toggleProductGroup(groupId: string) {
			const index = this.selectedProductGroups.indexOf(groupId)
			if (index > -1) {
				this.selectedProductGroups.splice(index, 1)
			} else {
				this.selectedProductGroups.push(groupId)
			}
		},
		clearProductGroups() {
			this.selectedProductGroups = []
		},

		// Clear all selections
		clearAll() {
			this.selectedDepots = []
			this.selectedClients = []
			this.selectedProducts = []
			this.selectedClientGroups = []
			this.selectedProductGroups = []
			this.selectionSource = null
		},

		// Bulk operations
		addClients(clientIds: string[], source: SelectionStoreState['selectionSource'] = 'groups') {
			for (const id of clientIds) {
				if (!this.selectedClients.includes(id)) {
					this.selectedClients.push(id)
				}
			}
			this.selectionSource = source
		},

		addProducts(productIds: string[], source: SelectionStoreState['selectionSource'] = 'groups') {
			for (const id of productIds) {
				if (!this.selectedProducts.includes(id)) {
					this.selectedProducts.push(id)
				}
			}
			this.selectionSource = source
		},

		removeClients(clientIds: string[]) {
			this.selectedClients = this.selectedClients.filter(id => !clientIds.includes(id))
		},

		removeProducts(productIds: string[]) {
			this.selectedProducts = this.selectedProducts.filter(id => !productIds.includes(id))
		},
	},
})
