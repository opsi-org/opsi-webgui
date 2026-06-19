<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppMessageBusStatusIcon - Reusable icon showing opsi-messagebus connection status.
-->
<template>
	<span class="relative inline-flex shrink-0 overflow-visible" :class="containerSizeClass">
		<span class="absolute top-0 left-0 inline-flex" :class="logoSizeClass">
			<img v-if="darkBg" :src="resolvedDarkSrc" :alt="alt" class="w-full h-full object-contain" />
			<CoreAppImage v-else src="~/assets/images/opsi-messagebus.svg"
				dark-src="~/assets/images/opsi-messagebus-light.svg" :alt="alt"
				image-class="w-full h-full object-contain" />
		</span>
		<span class="absolute bottom-0 right-0 inline-flex items-center justify-center rounded-full ring-2"
			:class="[badgeSizeClass, overlayBgClass, ringClass]">
			<UIcon :name="connected ? icons.check : icons.x" class="w-full h-full p-px text-white" />
		</span>
	</span>
</template>

<script setup lang="ts">
interface Props {
	connected: boolean
	size?: 'sm' | 'md' | 'lg'
	alt?: string
	darkBg?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	size: 'sm',
	alt: 'opsi',
	darkBg: false,
})

const icons = useIcons()

const assetImages = import.meta.glob<string>('~/assets/images/**/*', { eager: true, import: 'default' })
const resolvedDarkSrc = computed(() => {
	for (const [path, url] of Object.entries(assetImages)) {
		if (path.endsWith('opsi-messagebus-light.svg')) return url
	}
	return ''
})

const containerSizeClass = computed(() => {
	switch (props.size) {
		case 'sm': return 'w-5 h-5'
		case 'md': return 'w-6 h-6'
		case 'lg': return 'w-7 h-7'
		default: return 'w-5 h-5'
	}
})

const logoSizeClass = computed(() => {
	switch (props.size) {
		case 'sm': return 'w-3.5 h-3.5'
		case 'md': return 'w-4 h-4'
		case 'lg': return 'w-5 h-5'
		default: return 'w-3.5 h-3.5'
	}
})

const badgeSizeClass = computed(() => {
	switch (props.size) {
		case 'sm': return 'w-2.5 h-2.5'
		case 'md': return 'w-3 h-3'
		case 'lg': return 'w-3.5 h-3.5'
		default: return 'w-2.5 h-2.5'
	}
})

const connected = computed(() => props.connected)

const overlayBgClass = computed(() => (props.connected ? 'bg-[#009605]' : 'bg-[#d01030]'))

const ringClass = computed(() => (props.darkBg ? 'ring-2 ring-opsi-blue' : 'ring-2 ring-(--color-background)'))
</script>
