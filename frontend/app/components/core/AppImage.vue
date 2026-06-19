<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppImage - UI library wrapper for themed image rendering.
-->
<template>
	<template v-if="darkSrc">
		<img :src="resolvedSrc" :alt="alt" :class="imgClass" class="dark:hidden" />
		<img :src="resolvedDarkSrc" :alt="alt" :class="imgClass" class="hidden dark:block" />
	</template>
	<img v-else :src="resolvedSrc" :alt="alt" :class="imgClass" />
</template>

<script setup lang="ts">
interface Props {
	src: string
	darkSrc?: string
	alt?: string
	imageClass?: string
}

const props = withDefaults(defineProps<Props>(), {
	alt: '',
})

const imgClass = computed(() => props.imageClass || '')

const assetImages = import.meta.glob<string>('~/assets/images/**/*', { eager: true, import: 'default' })

const imageMap = new Map<string, string>()
for (const [path, url] of Object.entries(assetImages)) {
	const filename = path.split('/').pop()
	if (filename) imageMap.set(filename, url)
}

function resolveImagePath(path: string): string {
	const filename = path.split('/').pop()
	if (filename && imageMap.has(filename)) return imageMap.get(filename)!
	return path
}

const resolvedSrc = computed(() => resolveImagePath(props.src))
const resolvedDarkSrc = computed(() => props.darkSrc ? resolveImagePath(props.darkSrc) : '')
</script>
