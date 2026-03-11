<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
	<LayoutsPageLayout show-refresh :loading="loading" @refresh="fetchProductData">
		<template #tabs>
			<SharedTabsNav v-model="activeTab" :tabs="tabs" />
		</template>

		<!-- Error State -->
		<UAlert v-if="error" icon="i-heroicons-exclamation-triangle" color="error" class="mb-4" :title="$t('error')"
			:description="error" />

		<!-- No Product Selected -->
		<UCard v-if="!productId" class="text-center py-8">
			<UIcon :name="icons.product" class="w-12 h-12 mx-auto mb-3 text-(--color-text-muted)" />
			<p class="text-(--color-text-muted)">{{ $t('selectProduct') }}
			</p>
			<NuxtLink to="/products" class="mt-4 inline-block">
				<UButton color="primary" variant="soft">{{ $t('browseProducts') }}</UButton>
			</NuxtLink>
		</UCard>

		<template v-else>
			<!-- Product Info Card -->
			<UCard v-if="productInfo" class="mb-4">
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<UIcon :name="icons.product" class="w-6 h-6 text-opsi-blue" />
							<div>
								<h2 class="font-semibold text-lg">{{ productId }}</h2>
								<p v-if="productInfo.productDescription" class="text-sm text-(--color-text-muted)">
									{{ productInfo.productDescription }}
								</p>
							</div>
						</div>
						<UBadge
							v-if="productInfo.productVersions && Object.keys(productInfo.productVersions).length > 0"
							color="neutral" variant="soft">
							v{{ Object.values(productInfo.productVersions)[0] || '-' }}
						</UBadge>
					</div>
				</template>
				<div v-if="productInfo.productAdvice"
					class="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm rounded-lg">
					<UIcon :name="icons.warning" class="w-4 h-4 inline mr-1" />
					{{ productInfo.productAdvice }}
				</div>
			</UCard>

			<!-- Properties Tab -->
			<div v-if="activeTab === 'properties'">
				<UCard v-if="loading">
					<div class="py-8 text-center">
						<UIcon :name="icons.loading" class="w-8 h-8 animate-spin mx-auto text-opsi-blue" />
						<p class="mt-2 text-(--color-text-muted)">{{ $t('loading') }}...</p>
					</div>
				</UCard>

				<UCard v-else-if="properties.length === 0" class="text-center py-8">
					<UIcon :name="icons.settings" class="w-12 h-12 mx-auto mb-3 text-(--color-text-muted)" />
					<p class="text-(--color-text-muted)">{{ $t('noProperties') }}</p>
				</UCard>

				<div v-else class="space-y-3">
					<UCard v-for="prop in properties" :key="prop.propertyId">
						<div class="flex flex-col sm:flex-row sm:items-start gap-3">
							<!-- Property Info -->
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-1">
									<span class="font-medium">{{ prop.propertyId }}</span>
									<UBadge :color="prop.type === 'BoolProductProperty' ? 'info' : 'neutral'"
										variant="subtle" size="xs">
										{{ prop.type === 'BoolProductProperty' ? 'Boolean' : 'Text' }}
									</UBadge>
									<UBadge v-if="prop.multiValue" color="secondary" variant="subtle" size="xs">
										Multi
									</UBadge>
								</div>
								<p v-if="prop.description" class="text-sm text-(--color-text-muted) mb-2">
									{{ prop.description }}
								</p>
								<div class="flex flex-wrap gap-1 text-xs text-(--color-text-muted)">
									<span>{{ $t('default') }}: </span>
									<UBadge v-for="val in prop.default" :key="String(val)" color="neutral"
										variant="soft" size="xs">
										{{ String(val) }}
									</UBadge>
								</div>
							</div>

							<!-- Property Value Editor -->
							<div class="sm:w-48">
								<!-- Boolean property -->
								<UToggle v-if="prop.type === 'BoolProductProperty'" :model-value="Boolean(prop._value)"
									@update:model-value="(v: boolean) => prop._value = v" :disabled="!prop.editable" />

								<!-- Text property with possible values -->
								<USelect v-else-if="prop.allValues && prop.allValues.length > 0"
									:model-value="String(prop._value ?? '')"
									@update:model-value="(v) => prop._value = String(v ?? '')"
									:options="prop.allValues.map(v => ({ label: String(v), value: String(v) }))"
									:disabled="!prop.editable" size="sm" class="w-full" />

								<!-- Free text property -->
								<UInput v-else :model-value="String(prop._value ?? '')"
									@update:model-value="(v: string) => prop._value = v" :disabled="!prop.editable"
									size="sm" class="w-full" />
							</div>
						</div>
					</UCard>

					<!-- Save Button -->
					<div class="flex justify-end pt-4">
						<UButton color="primary" :loading="saving" :disabled="!hasPropertyChanges"
							@click="saveProperties">
							<UIcon :name="icons.check" class="w-4 h-4 mr-1" />
							{{ $t('saveChanges') }}
						</UButton>
					</div>
				</div>
			</div>

			<!-- Dependencies Tab -->
			<div v-if="activeTab === 'dependencies'">
				<UCard v-if="loading">
					<div class="py-8 text-center">
						<UIcon :name="icons.loading" class="w-8 h-8 animate-spin mx-auto text-opsi-blue" />
						<p class="mt-2 text-(--color-text-muted)">{{ $t('loading') }}...</p>
					</div>
				</UCard>

				<UCard v-else-if="dependencies.length === 0" class="text-center py-8">
					<UIcon :name="icons.product" class="w-12 h-12 mx-auto mb-3 text-(--color-text-muted)" />
					<p class="text-(--color-text-muted)">{{ $t('noDependencies') }}</p>
				</UCard>

				<div v-else class="space-y-2">
					<UCard v-for="(dep, index) in dependencies" :key="index">
						<div class="flex items-center gap-3">
							<UIcon :name="icons.arrowRight" class="w-5 h-5 text-(--color-text-muted)" />
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2">
									<NuxtLink :to="`/products/${dep.requiredProductId}`"
										class="font-medium text-opsi-blue hover:underline">
										{{ dep.requiredProductId }}
									</NuxtLink>
									<UBadge v-if="dep.requiredVersion" color="neutral" variant="soft" size="xs">
										{{ dep.requiredVersion }}
									</UBadge>
								</div>
								<div class="flex flex-wrap gap-2 mt-1 text-xs text-(--color-text-muted)">
									<span v-if="dep.requirementType">
										<strong>{{ $t('type') }}:</strong> {{ dep.requirementType }}
									</span>
									<span v-if="dep.requiredAction">
										<strong>{{ $t('action') }}:</strong> {{ dep.requiredAction }}
									</span>
									<span v-if="dep.requiredInstallationStatus">
										<strong>{{ $t('status') }}:</strong> {{ dep.requiredInstallationStatus }}
									</span>
								</div>
							</div>
						</div>
					</UCard>
				</div>
			</div>
		</template>
	</LayoutsPageLayout>
</template>

<script setup lang="ts">
import { useStateStore } from '~/stores/stateStore'

definePageMeta({ layout: 'default' })

type PropertyValue = string | boolean | string[]

interface ProductProperty {
	productId: string
	propertyId: string
	type: 'UnicodeProductProperty' | 'BoolProductProperty'
	version: string
	description: string
	multiValue: boolean
	editable: boolean
	default: (string | boolean)[]
	allValues: (string | boolean)[]
	_value?: PropertyValue
	_originalValue?: PropertyValue
}

interface ProductDependency {
	productId: string
	productAction: string | null
	version: string
	requiredProductId: string
	requiredVersion: string | null
	requiredAction: string | null
	requiredInstallationStatus: string | null
	requirementType: string | null
}

interface ProductInfo {
	productVersions: Record<string, string | undefined>
	productDescription: string
	productAdvice: string
}

const icons = useIcons()
const { t: $t } = useI18n()
const route = useRoute()
const { getProductProperties, saveProductProperties, getProductDependencies } = useApiHelpers()
const stateStore = useStateStore()

const productId = computed(() => route.params.id as string | undefined)
const activeTab = ref<'properties' | 'dependencies'>('properties')
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

const properties = ref<ProductProperty[]>([])
const dependencies = ref<ProductDependency[]>([])
const productInfo = ref<ProductInfo | null>(null)

const tabs = [
	{ label: String($t('properties')), value: 'properties' },
	{ label: String($t('dependencies')), value: 'dependencies' },
]

const hasPropertyChanges = computed(() => {
	return properties.value.some(p => p._value !== p._originalValue)
})

async function fetchProductData() {
	if (!productId.value) return

	loading.value = true
	error.value = null

	try {
		// Ensure we have depots selected
		await stateStore.ensureDepotsSelected()

		const depots = stateStore.selectedDepots

		// Fetch properties
		const propsResult = await getProductProperties(productId.value, { selectedDepots: depots })
		if (propsResult.error) {
			throw propsResult.error
		}
		if (propsResult.data) {
			productInfo.value = {
				productVersions: propsResult.data.productVersions,
				productDescription: propsResult.data.productDescription,
				productAdvice: propsResult.data.productAdvice,
			}
			properties.value = Object.values(propsResult.data.properties || {}).map(p => ({
				...p,
				_value: p.default?.[0] ?? '',
				_originalValue: p.default?.[0] ?? '',
			}))
		}

		// Fetch dependencies
		const depsResult = await getProductDependencies(productId.value)
		if (depsResult.error) {
			console.warn('Failed to fetch dependencies:', depsResult.error)
		}
		if (depsResult.data) {
			dependencies.value = depsResult.data.dependencies || []
			// Merge product info if not already set
			if (!productInfo.value && depsResult.data.productDescription) {
				productInfo.value = {
					productVersions: depsResult.data.productVersions,
					productDescription: depsResult.data.productDescription,
					productAdvice: depsResult.data.productAdvice,
				}
			}
		}
	} catch (e) {
		console.error('Failed to fetch product data:', e)
		error.value = e instanceof Error ? e.message : String($t('errorFetchingData'))
	} finally {
		loading.value = false
	}
}

async function saveProperties() {
	if (!productId.value || !hasPropertyChanges.value) return

	saving.value = true
	error.value = null

	try {
		const changedProps: Record<string, PropertyValue> = {}
		properties.value.forEach(p => {
			if (p._value !== p._originalValue) {
				changedProps[p.propertyId] = p._value!
			}
		})

		const result = await saveProductProperties(productId.value, {
			depotIds: stateStore.selectedDepots,
			properties: changedProps,
		})

		if (result.error) {
			throw result.error
		}

		// Update original values
		properties.value.forEach(p => {
			p._originalValue = p._value
		})
	} catch (e) {
		console.error('Failed to save properties:', e)
		error.value = e instanceof Error ? e.message : String($t('errorSavingProperties'))
	} finally {
		saving.value = false
	}
}

// Fetch data when product changes
watch(productId, () => {
	if (productId.value) {
		fetchProductData()
	}
}, { immediate: true })
</script>
