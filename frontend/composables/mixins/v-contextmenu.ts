// Custom Directive to handle the right-click context menu.

import type { Directive, DirectiveBinding } from 'vue'

export const vContextmenu: Directive = {
  beforeMount(element: HTMLElement, binding: DirectiveBinding) {
    element.addEventListener('contextmenu', (event: MouseEvent) => {
      event.preventDefault()
      binding.value(event)
    })
  },
  unmounted(element: HTMLElement, binding: DirectiveBinding) {
    element.removeEventListener('contextmenu', (event: MouseEvent) => {
      event.preventDefault()
      binding.value(event)
    })
  },
}
