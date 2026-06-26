/**
 * Vitest setup file : provides Vue auto-imports that Nuxt normally handles
 */
import {
  computed,
  reactive,
  ref,
  watch,
  watchEffect,
  toRef,
  toRefs,
  unref,
  isRef,
  shallowRef,
  triggerRef,
  readonly,
  shallowReactive,
} from 'vue'

// Make Vue composition API available globally (mimics Nuxt auto-imports)
Object.assign(globalThis, {
  computed,
  reactive,
  ref,
  watch,
  watchEffect,
  toRef,
  toRefs,
  unref,
  isRef,
  shallowRef,
  triggerRef,
  readonly,
  shallowReactive,
  useI18n: () => ({ t: (key: string) => key, locale: ref('en') }),
})
