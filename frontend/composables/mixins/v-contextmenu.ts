/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
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
