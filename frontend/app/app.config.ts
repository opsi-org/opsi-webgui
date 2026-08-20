/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * app.config.ts - Nuxt UI component theming overrides and design system configuration.
 */
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'custom',
      neutral: 'zinc',
    },
    card: {
      slots: {
        root: 'bg-(--color-background) border border-(--color-border)/50 rounded-xl shadow-sm transition-all duration-150 hover:shadow-md',
        header: 'border-b border-(--color-border)/50 px-3 py-2',
        body: 'p-3',
      },
    },
    button: {
      slots: {
        base: 'font-medium transition-colors',
      },
      defaultVariants: {
        color: 'primary',
        variant: 'solid',
      },
      variants: {
        variant: {
          solid: '',
          outline: 'bg-transparent border',
          soft: '',
          ghost: 'bg-transparent hover:bg-(--color-surface-hover)',
          link: 'bg-transparent',
        },
        color: {
          primary: '',
          secondary: '',
          success: '',
          info: '',
          warning: '',
          error: '',
          neutral: '',
        },
      },
      compoundVariants: [
        /* ---- Primary ---- */
        {
          color: 'primary',
          variant: 'solid',
          class:
            'bg-(--color-primary) text-(--color-primary-text) hover:bg-(--color-primary-hover) disabled:opacity-100 disabled:bg-(--color-primary-disabled)',
        },
        {
          color: 'primary',
          variant: 'outline',
          class: 'border-(--color-primary) text-(--color-primary-soft-text) hover:bg-(--color-primary-soft-bg)',
        },
        {
          color: 'primary',
          variant: 'soft',
          class:
            'bg-(--color-primary-soft-bg) text-(--color-primary-soft-text) ring-1 ring-inset ring-(--color-primary-soft-ring) hover:opacity-80',
        },
        {
          color: 'primary',
          variant: 'ghost',
          class: 'text-(--color-primary-soft-text) hover:bg-(--color-primary-soft-bg)',
        },
        {
          color: 'primary',
          variant: 'link',
          class: 'text-(--color-primary-soft-text) hover:underline',
        },
        /* ---- Secondary (neutral text/bg) ---- */
        {
          color: 'secondary',
          variant: 'solid',
          class: 'bg-(--color-surface) text-(--color-text) hover:bg-(--color-surface-hover)',
        },
        {
          color: 'secondary',
          variant: 'outline',
          class: 'border-(--color-border) text-(--color-text) hover:bg-(--color-surface)',
        },
        {
          color: 'secondary',
          variant: 'soft',
          class: 'bg-(--color-bg-muted) text-(--color-text) ring-1 ring-inset ring-(--color-border)/30 hover:bg-(--color-surface-hover)',
        },
        {
          color: 'secondary',
          variant: 'ghost',
          class: 'text-(--color-text) hover:bg-(--color-surface-hover)',
        },
        {
          color: 'secondary',
          variant: 'link',
          class: 'text-(--color-text-secondary) hover:underline',
        },
        /* ---- Success ---- */
        {
          color: 'success',
          variant: 'solid',
          class: 'bg-(--color-success) text-(--color-success-text) hover:bg-(--color-success-hover)',
        },
        {
          color: 'success',
          variant: 'outline',
          class: 'border-(--color-success) text-(--color-success-soft-text) hover:bg-(--color-success-soft-bg)',
        },
        {
          color: 'success',
          variant: 'soft',
          class:
            'bg-(--color-success-soft-bg) text-(--color-success-soft-text) ring-1 ring-inset ring-(--color-success-soft-ring) hover:opacity-80',
        },
        {
          color: 'success',
          variant: 'ghost',
          class: 'text-(--color-success-soft-text) hover:bg-(--color-success-soft-bg)',
        },
        {
          color: 'success',
          variant: 'link',
          class: 'text-(--color-success-soft-text) hover:underline',
        },
        /* ---- Info ---- */
        {
          color: 'info',
          variant: 'solid',
          class: 'bg-(--color-info) text-(--color-info-text) hover:bg-(--color-info-hover)',
        },
        {
          color: 'info',
          variant: 'outline',
          class: 'border-(--color-info) text-(--color-info-soft-text) hover:bg-(--color-info-soft-bg)',
        },
        {
          color: 'info',
          variant: 'soft',
          class: 'bg-(--color-info-soft-bg) text-(--color-info-soft-text) ring-1 ring-inset ring-(--color-info-soft-ring) hover:opacity-80',
        },
        {
          color: 'info',
          variant: 'ghost',
          class: 'text-(--color-info-soft-text) hover:bg-(--color-info-soft-bg)',
        },
        { color: 'info', variant: 'link', class: 'text-(--color-info-soft-text) hover:underline' },
        /* ---- Warning ---- */
        {
          color: 'warning',
          variant: 'solid',
          class: 'bg-(--color-warning) text-(--color-warning-text) hover:bg-(--color-warning-hover)',
        },
        {
          color: 'warning',
          variant: 'outline',
          class: 'border-(--color-warning) text-(--color-warning-soft-text) hover:bg-(--color-warning-soft-bg)',
        },
        {
          color: 'warning',
          variant: 'soft',
          class:
            'bg-(--color-warning-soft-bg) text-(--color-warning-soft-text) ring-1 ring-inset ring-(--color-warning-soft-ring) hover:opacity-80',
        },
        {
          color: 'warning',
          variant: 'ghost',
          class: 'text-(--color-warning-soft-text) hover:bg-(--color-warning-soft-bg)',
        },
        {
          color: 'warning',
          variant: 'link',
          class: 'text-(--color-warning-soft-text) hover:underline',
        },
        /* ---- Error ---- */
        {
          color: 'error',
          variant: 'solid',
          class: 'bg-(--color-error) text-(--color-error-text) hover:bg-(--color-error-hover)',
        },
        {
          color: 'error',
          variant: 'outline',
          class: 'border-(--color-error) text-(--color-error-soft-text) hover:bg-(--color-error-soft-bg)',
        },
        {
          color: 'error',
          variant: 'soft',
          class:
            'bg-(--color-error-soft-bg) text-(--color-error-soft-text) ring-1 ring-inset ring-(--color-error-soft-ring) hover:opacity-80',
        },
        {
          color: 'error',
          variant: 'ghost',
          class: 'text-(--color-error-soft-text) hover:bg-(--color-error-soft-bg)',
        },
        {
          color: 'error',
          variant: 'link',
          class: 'text-(--color-error-soft-text) hover:underline',
        },
        /* ---- Neutral ---- */
        {
          color: 'neutral',
          variant: 'solid',
          class: 'bg-(--color-surface) text-(--color-text) hover:bg-(--color-surface-hover)',
        },
        {
          color: 'neutral',
          variant: 'outline',
          class: 'border-(--color-border) text-(--color-text) hover:bg-(--color-surface)',
        },
        {
          color: 'neutral',
          variant: 'soft',
          class: 'bg-(--color-bg-muted) text-(--color-text) ring-1 ring-inset ring-(--color-border)/30 hover:bg-(--color-surface-hover)',
        },
        {
          color: 'neutral',
          variant: 'ghost',
          class: 'text-(--color-text) hover:bg-(--color-surface-hover)',
        },
        {
          color: 'neutral',
          variant: 'link',
          class: 'text-(--color-text-muted) hover:text-(--color-text) hover:underline',
        },
      ],
    },
    select: {
      slots: {
        base: 'bg-(--color-background) border border-(--color-border) text-(--color-text) rounded-lg transition-all duration-150 hover:bg-(--color-surface-hover) focus:border-(--color-primary)',
      },
    },
    selectMenu: {
      slots: {
        base: 'bg-(--color-background) border border-(--color-border) text-(--color-text) rounded-lg',
        content: 'bg-(--color-surface-elevated) border border-(--color-border)/50 shadow-lg rounded-xl',
        item: 'text-(--color-text) rounded-lg transition-colors duration-100 hover:bg-(--color-surface-hover) data-[highlighted]:bg-(--color-surface-hover) data-[state=checked]:bg-(--color-primary-soft-bg) data-[state=checked]:text-(--color-text)',
        itemLeadingIcon: 'text-(--color-text-muted)',
      },
    },
    toggle: {
      slots: {
        root: 'bg-(--color-border) data-[state=checked]:bg-(--color-primary)',
        thumb: 'bg-white dark:bg-(--color-text)',
      },
    },
    formGroup: {
      slots: {
        root: 'rounded-lg p-1.5 -mx-1.5 transition-colors duration-100 hover:bg-(--color-surface-hover)/50',
        label: 'text-sm font-medium text-(--color-text)',
      },
    },
    table: {
      slots: {
        root: 'bg-(--color-background) border border-(--color-border)/50 rounded-xl overflow-hidden',
        thead: 'bg-(--color-surface)',
        th: 'text-(--color-text-muted) text-xs font-medium tracking-wide px-2 py-1',
        td: 'text-(--color-text) px-2.5 py-1.5',
        tr: 'hover:bg-(--color-surface-hover) transition-colors duration-100 border-b border-(--color-border)/30 last:border-b-0',
      },
    },
    badge: {
      variants: {
        variant: {
          solid: '',
          outline: 'bg-transparent border',
          soft: '',
          subtle: '',
        },
        color: {
          primary: '',
          secondary: '',
          success: '',
          info: '',
          warning: '',
          error: '',
          neutral: '',
        },
      },
      compoundVariants: [
        /* Primary */
        {
          color: 'primary',
          variant: 'solid',
          class: 'bg-(--color-primary) text-(--color-primary-text)',
        },
        {
          color: 'primary',
          variant: 'outline',
          class: 'border-(--color-primary) text-(--color-primary-soft-text)',
        },
        {
          color: 'primary',
          variant: 'soft',
          class: 'bg-(--color-primary-soft-bg) text-(--color-primary-soft-text) ring-1 ring-inset ring-(--color-primary-soft-ring)',
        },
        {
          color: 'primary',
          variant: 'subtle',
          class: 'bg-(--color-primary-soft-bg) text-(--color-primary-soft-text)',
        },
        /* Success */
        {
          color: 'success',
          variant: 'solid',
          class: 'bg-(--color-success) text-(--color-success-text)',
        },
        {
          color: 'success',
          variant: 'outline',
          class: 'border-(--color-success) text-(--color-success-soft-text)',
        },
        {
          color: 'success',
          variant: 'soft',
          class: 'bg-(--color-success-soft-bg) text-(--color-success-soft-text) ring-1 ring-inset ring-(--color-success-soft-ring)',
        },
        {
          color: 'success',
          variant: 'subtle',
          class: 'bg-(--color-success-soft-bg) text-(--color-success-soft-text)',
        },
        /* Info */
        { color: 'info', variant: 'solid', class: 'bg-(--color-info) text-(--color-info-text)' },
        {
          color: 'info',
          variant: 'outline',
          class: 'border-(--color-info) text-(--color-info-soft-text)',
        },
        {
          color: 'info',
          variant: 'soft',
          class: 'bg-(--color-info-soft-bg) text-(--color-info-soft-text) ring-1 ring-inset ring-(--color-info-soft-ring)',
        },
        {
          color: 'info',
          variant: 'subtle',
          class: 'bg-(--color-info-soft-bg) text-(--color-info-soft-text)',
        },
        /* Warning */
        {
          color: 'warning',
          variant: 'solid',
          class: 'bg-(--color-warning) text-(--color-warning-text)',
        },
        {
          color: 'warning',
          variant: 'outline',
          class: 'border-(--color-warning) text-(--color-warning-soft-text)',
        },
        {
          color: 'warning',
          variant: 'soft',
          class: 'bg-(--color-warning-soft-bg) text-(--color-warning-soft-text) ring-1 ring-inset ring-(--color-warning-soft-ring)',
        },
        {
          color: 'warning',
          variant: 'subtle',
          class: 'bg-(--color-warning-soft-bg) text-(--color-warning-soft-text)',
        },
        /* Error */
        { color: 'error', variant: 'solid', class: 'bg-(--color-error) text-(--color-error-text)' },
        {
          color: 'error',
          variant: 'outline',
          class: 'border-(--color-error) text-(--color-error-soft-text)',
        },
        {
          color: 'error',
          variant: 'soft',
          class: 'bg-(--color-error-soft-bg) text-(--color-error-soft-text) ring-1 ring-inset ring-(--color-error-soft-ring)',
        },
        {
          color: 'error',
          variant: 'subtle',
          class: 'bg-(--color-error-soft-bg) text-(--color-error-soft-text)',
        },
        /* Neutral */
        { color: 'neutral', variant: 'solid', class: 'bg-(--color-surface) text-(--color-text)' },
        {
          color: 'neutral',
          variant: 'outline',
          class: 'border-(--color-border) text-(--color-text)',
        },
        {
          color: 'neutral',
          variant: 'soft',
          class: 'bg-(--color-bg-muted) text-(--color-text) ring-1 ring-inset ring-(--color-border)/30',
        },
        {
          color: 'neutral',
          variant: 'subtle',
          class: 'bg-(--color-bg-muted) text-(--color-text-muted)',
        },
      ],
    },
    dropdown: {
      slots: {
        content: 'bg-(--color-surface-elevated) border border-(--color-border)/50 shadow-lg rounded-xl',
        item: 'text-(--color-text) rounded-lg hover:bg-(--color-surface-hover) transition-colors duration-100',
      },
    },
    popover: {
      slots: {
        content: 'bg-(--color-surface-elevated) border border-(--color-border)/50 shadow-lg rounded-xl',
      },
    },
    tooltip: {
      slots: {
        content: 'bg-(--color-surface-elevated) text-(--color-text) text-xs px-2 py-1 rounded shadow-lg border border-(--color-border)',
      },
    },
    modal: {
      slots: {
        content: 'bg-(--color-background) border border-(--color-border)/50 rounded-xl',
        header: 'text-(--color-text)',
        body: 'text-(--color-text)',
      },
    },
    slideover: {
      slots: {
        content: 'bg-(--color-background) border-l border-(--color-border)/50',
        header: 'text-(--color-text)',
        body: 'text-(--color-text)',
      },
    },
    tabs: {
      slots: {
        root: '',
        list: 'bg-transparent rounded-lg gap-1 p-0.5',
        trigger:
          'text-(--color-text-muted) border border-(--color-border) hover:border-(--color-primary) hover:text-(--color-primary-soft-text) data-[state=active]:bg-(--color-primary) data-[state=active]:text-white data-[state=active]:border-(--color-primary) data-[state=active]:shadow-sm rounded-md transition-all duration-150',
        content: '',
      },
    },
    input: {
      slots: {
        root: 'bg-(--color-background) border border-(--color-border) text-(--color-text) rounded-lg transition-all duration-150 focus-within:border-(--color-primary)',
      },
    },
    textarea: {
      slots: {
        root: 'bg-(--color-background) border border-(--color-border) text-(--color-text) rounded-lg',
      },
    },
    checkbox: {
      slots: {
        root: 'border-(--color-border) data-[state=checked]:border-(--color-primary) data-[state=checked]:bg-(--color-primary) data-[state=checked]:text-white',
      },
    },
    alert: {
      slots: {
        root: 'bg-(--color-background) border border-(--color-border)/50 rounded-xl',
        title: 'text-(--color-text)',
        description: 'text-(--color-text-secondary)',
      },
    },
    separator: {
      slots: {
        root: 'border-(--color-border)',
      },
    },
    formField: {
      slots: {
        root: 'rounded-lg p-1.5 -mx-1.5 transition-colors duration-100 hover:bg-(--color-surface-hover)/50',
        label: 'text-sm font-medium text-(--color-text)',
      },
    },
    drawer: {
      slots: {
        content: 'bg-(--color-background) border border-(--color-border)/50',
        header: 'text-(--color-text)',
        body: 'text-(--color-text)',
      },
    },
    commandPalette: {
      slots: {
        root: 'bg-(--color-surface-elevated) border border-(--color-border)/50 rounded-xl shadow-lg',
        input: 'bg-(--color-background) text-(--color-text)',
        item: 'text-(--color-text) rounded-lg hover:bg-(--color-surface-hover)',
      },
    },
    contextMenu: {
      slots: {
        content: 'bg-(--color-surface-elevated) border border-(--color-border)/50 shadow-lg rounded-xl',
        item: 'text-(--color-text) rounded-lg hover:bg-(--color-surface-hover)',
      },
    },
    radioGroup: {
      slots: {
        root: '',
        item: 'text-(--color-text)',
        indicator: 'border-(--color-border) data-[state=checked]:border-(--color-primary) data-[state=checked]:bg-(--color-primary)',
      },
    },
    skeleton: {
      base: 'bg-(--color-surface-hover) animate-pulse rounded-lg',
    },
    toast: {
      slots: {
        root: 'bg-(--color-surface-elevated) border border-(--color-border)/50 shadow-lg rounded-xl text-(--color-text)',
      },
    },
    pagination: {
      slots: {
        root: '',
        list: 'gap-1',
        item: 'text-(--color-text)',
      },
    },
    progress: {
      slots: {
        root: 'bg-(--color-surface-hover)',
        indicator: 'bg-(--color-primary)',
      },
    },
    accordion: {
      slots: {
        root: '',
        header: 'text-(--color-text)',
        body: 'text-(--color-text)',
        content: 'bg-(--color-background)',
      },
    },
  },
})
