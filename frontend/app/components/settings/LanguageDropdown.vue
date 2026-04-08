<template>
  <div class="relative" ref="containerRef">
    <button @click="open = !open" type="button"
      class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors bg-opsi-blue text-white hover:bg-opsi-blue/90"
      data-testid="language-dropdown">
      <UIcon :name="icons.language" class="w-3.5 h-3.5" />
      <span class="text-xs font-medium">{{ currentLocale.toUpperCase() }}</span>
      <UIcon :name="icons.chevronDown" class="w-3 h-3 transition-transform" :class="{ 'rotate-180': open }" />
    </button>
    <Transition :name="direction === 'up' ? 'dropdown-up' : 'dropdown'">
      <div v-if="open" :class="[
        'absolute right-0 min-w-32 bg-white dark:bg-(--color-surface) border border-(--color-border) rounded-lg shadow-lg z-50 py-1',
        direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
      ]">
        <button v-for="locale in availableLocales" :key="locale.code" @click="switchTo(locale.code)" type="button"
          class="w-full px-3 py-2 text-left text-sm text-(--color-text) hover:bg-(--color-surface-hover) transition-colors"
          :data-testid="`language-dropdown-item-${locale.code}`">
          {{ locale.name || locale.code.toUpperCase() }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  direction?: 'up' | 'down'
}>()

const icons = useIcons()
const { locale, locales, setLocale } = useI18n()
const currentLocale = computed(() => locale.value || 'en')

const open = ref(false)
const containerRef = ref<HTMLElement | null>(null)

interface LocaleInfo { code: string; name?: string }

const availableLocales = computed(() => {
  const allLocales = locales.value as LocaleInfo[]
  return allLocales.filter(l => l.code !== currentLocale.value)
})

function switchTo(code: string) {
  setLocale(code as 'de' | 'en')
  open.value = false
}

onMounted(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
      open.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => document.removeEventListener('click', handleClickOutside))
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active,
.dropdown-up-enter-active,
.dropdown-up-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.dropdown-up-enter-from,
.dropdown-up-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>