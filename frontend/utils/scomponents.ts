/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
export function makeToast(
  vm: {
    $bvToast: {
      toast: (
        arg0: string,
        arg1: {
          title: string
          toaster: string
          variant: string
          autoHideDelay: number
          appendToast: boolean
        },
      ) => void
    }
  },
  message: string = '',
  title: string = '',
  variant: string = 'primary',
  autoHideDelay: number = 6000,
  append = false,
): void {
  vm.$bvToast.toast(message, {
    // id: 'MakeToast', // MakeToast__toast_outer
    title,
    toaster: 'b-toaster-bottom-right',
    variant,
    autoHideDelay,
    appendToast: append,
  })
}
export default {
  makeToast,
}
// '{ id: string; title: string; toaster: string; variant: string; autoHideDelay: number; appendToast: boolean; }' is not assignable to parameter of type
// '{             title: string; toaster: string; variant: string; autoHideDelay: number; appendToast: boolean; }'.
