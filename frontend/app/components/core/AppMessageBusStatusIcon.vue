<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppMessageBusStatusIcon - Reusable icon showing opsi-messagebus connection status.
-->
<template>
	<span class="relative inline-flex w-6 h-6 items-center justify-center">
		<span class="w-8 h-8">
			<img v-if="darkBg" :src="resolvedDarkSrc" :alt="alt" class="w-full h-full object-contain" />
			<CoreAppImage v-else src="~/assets/images/opsi-messagebus.svg"
				dark-src="~/assets/images/opsi-messagebus-light.svg" :alt="alt"
				image-class="min-h-8 min-w-8 w-full h-full object-contain" />
		</span>
		<span class="absolute -right-4 -bottom-1 w-3.5 h-3.5 rounded-full inline-flex items-center justify-center"
			:class="[overlayBgClass, ringClass]">
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
	size: 'md',
	alt: 'opsi',
	darkBg: false,
})

const icons = useIcons()

const assetImages = import.meta.glob<string>('~/assets/images/**/*', {
	eager: true,
	import: 'default',
})

const resolvedDarkSrc = computed(() => {
	for (const [path, url] of Object.entries(assetImages)) {
		if (path.endsWith('opsi-messagebus-light.svg')) return url
	}
	return ''
})

const connected = computed(() => props.connected)

const overlayBgClass = computed(() =>
	props.connected ? 'bg-[#009605]' : 'bg-[#d01030]'
)

const ringClass = computed(() =>
	props.darkBg
		? 'ring-2 ring-opsi-blue'
		: 'ring-2 ring-(--color-background)'
)
</script>
