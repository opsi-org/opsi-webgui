export default defineAppConfig({
  ui: {
    colors: {
      primary: 'custom',
      neutral: 'zinc',
    },
    card: {
      slots: {
        root: 'bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)]/50 dark:border-[var(--color-border)]/50 rounded-xl shadow-sm transition-shadow duration-150 hover:shadow-md',
        header:
          'border-b border-[var(--color-border)]/50 dark:border-[var(--color-border)]/50 px-4 py-3',
        body: 'p-4',
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
          ghost:
            'text-[var(--color-text)] dark:text-[var(--color-text)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)]',
          soft: 'text-[var(--color-text)] dark:text-[var(--color-text)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)] dark:hover:bg-[var(--color-border)]',
          outline:
            'text-[var(--color-text)] dark:text-[var(--color-text)] border-[var(--color-border)] dark:border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] dark:hover:bg-[var(--color-surface-hover)]',
          link: 'text-[var(--color-opsi-blue)] hover:text-[var(--color-opsi-deep-blue)] dark:text-[#6b98e8] dark:hover:text-[#8fb3f5]',
        },
        color: {
          primary:
            'bg-[var(--color-opsi-blue)] text-[var(--color-text)] dark:text-[var(--color-text)]',
          neutral: 'text-[var(--color-text)] dark:text-[var(--color-text)]',
        },
      },
    },
    input: {
      slots: {
        root: 'w-full',
        base: 'bg-white dark:bg-[var(--color-surface)] border border-transparent text-[var(--color-text)] dark:text-[var(--color-text)] placeholder-[var(--color-text-muted)] dark:placeholder-[var(--color-text-muted)] rounded-lg transition-all duration-150 hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)] focus:border-[var(--color-opsi-blue)] focus:ring-[var(--color-opsi-blue)]/20 focus:bg-white dark:focus:bg-[var(--color-surface)]',
      },
    },
    select: {
      slots: {
        base: 'bg-white dark:bg-[var(--color-surface)] border border-transparent text-[var(--color-text)] dark:text-[var(--color-text)] rounded-lg transition-all duration-150 hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)] focus:border-[var(--color-opsi-blue)]',
      },
    },
    selectMenu: {
      slots: {
        base: 'bg-white dark:bg-[var(--color-surface)] border border-transparent text-[var(--color-text)] dark:text-[var(--color-text)] rounded-lg',
        trigger:
          'ring-[var(--color-opsi-blue)] focus:ring-[var(--color-opsi-blue)] data-[state=open]:ring-[var(--color-opsi-blue)]',
        content:
          'bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)]/50 dark:border-[var(--color-border)]/50 shadow-lg rounded-xl',
        item: 'text-[var(--color-text)] dark:text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)] transition-colors duration-100',
        itemLeadingIcon: 'text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)]',
      },
    },
    toggle: {
      slots: {
        root: 'bg-[var(--color-border)] dark:bg-[var(--color-border)] data-[state=checked]:bg-[var(--color-opsi-blue)]',
        thumb: 'bg-white dark:bg-[var(--color-text)]',
      },
    },
    formGroup: {
      slots: {
        root: 'rounded-lg p-2 -mx-2 transition-colors duration-100 hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)]/50',
        label: 'text-sm font-medium text-[var(--color-text)] dark:text-[var(--color-text)]',
      },
    },
    table: {
      slots: {
        root: 'bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)]/50 rounded-xl overflow-hidden',
        thead: 'bg-[var(--color-surface)] dark:bg-[var(--color-background)]',
        th: 'font-[Montserrat] text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider px-4 py-3',
        td: 'text-[var(--color-text)] dark:text-[var(--color-text)] px-4 py-3',
        tr: 'hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)] transition-colors duration-100 border-b border-[var(--color-border)]/30 dark:border-[var(--color-border)]/30 last:border-b-0',
      },
    },
    badge: {
      variants: {
        color: {
          primary:
            'bg-[var(--color-opsi-blue)]/15 text-[var(--color-opsi-blue)] dark:bg-[var(--color-opsi-blue)]/25 dark:text-[#8fb3f5]',
          success:
            'bg-[var(--color-opsi-success)]/15 text-[var(--color-opsi-success)] dark:bg-[var(--color-opsi-success)]/25 dark:text-[#4ade80]',
          warning:
            'bg-[var(--color-opsi-warning)]/15 text-[var(--color-opsi-warning)] dark:bg-[var(--color-opsi-warning)]/25 dark:text-[#fbbf24]',
          error:
            'bg-[var(--color-opsi-error)]/15 text-[var(--color-opsi-error)] dark:bg-[var(--color-opsi-error)]/25 dark:text-[#f87171]',
          neutral:
            'bg-[var(--color-surface)] dark:bg-[var(--color-surface-hover)] text-[var(--color-text)] dark:text-[var(--color-text)]',
        },
      },
    },
    dropdown: {
      slots: {
        content:
          'bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)]/50 dark:border-[var(--color-border)]/50 shadow-lg rounded-xl',
        item: 'text-[var(--color-text)] dark:text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)] transition-colors duration-100',
      },
    },
    popover: {
      slots: {
        content:
          'bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)]/50 dark:border-[var(--color-border)]/50 shadow-lg rounded-xl',
      },
    },
    tooltip: {
      slots: {
        content:
          'bg-[var(--color-surface)] dark:bg-[var(--color-surface-hover)] text-[var(--color-text)] dark:text-[var(--color-text)] text-xs px-2 py-1 rounded shadow-lg border border-[var(--color-border)]',
      },
    },
    modal: {
      slots: {
        content:
          'bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)]/50 dark:border-[var(--color-border)]/50 rounded-xl',
        header: 'text-[var(--color-text)] dark:text-[var(--color-text)]',
        body: 'text-[var(--color-text)] dark:text-[var(--color-text)]',
      },
    },
    slideover: {
      slots: {
        content:
          'bg-white dark:bg-[var(--color-surface)] border-l border-[var(--color-border)]/50 dark:border-[var(--color-border)]/50',
        header: 'text-[var(--color-text)] dark:text-[var(--color-text)]',
        body: 'text-[var(--color-text)] dark:text-[var(--color-text)]',
      },
    },
  },
})
