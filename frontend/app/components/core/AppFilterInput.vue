<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppFilterInput - Search/filter input with clear button.
-->
<template>
	<UInput v-model="model" :placeholder="placeholder || $t('typeToFilter')"
		:aria-label="placeholder || $t('typeToFilter')" :icon="icons.filter" :size="size" :class="inputClass">
		<template v-if="model" #trailing>
			<UButton :icon="icons.x" size="xs" variant="link" color="neutral" :aria-label="String($t('clear'))"
				:title="String($t('clear'))" @click="model = ''" />
		</template>
	</UInput>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
	placeholder?: string
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
	inputClass?: string
}>(), {
	size: 'sm',
	inputClass: 'w-full sm:w-48 md:w-64',
})

const model = defineModel<string>({ default: '' })

const icons = useIcons()
const { t: $t } = useI18n()
</script>
