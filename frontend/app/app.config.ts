export default defineAppConfig({
  ui: {
    colors: {
      // Use custom opsi colors - defined via CSS variables in main.css
      primary: 'custom',
      neutral: 'zinc',
    },
    card: {
      slots: {
        root: 'bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] dark:border-[var(--color-border)] rounded-lg shadow-sm',
        header: 'border-b border-[var(--color-border)] dark:border-[var(--color-border)] px-4 py-3',
        body: 'p-4',
      }
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
          ghost: 'text-[var(--color-text)] dark:text-[var(--color-text)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)]',
          soft: 'text-[var(--color-text)] dark:text-[var(--color-text)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)] dark:hover:bg-[var(--color-border)]',
          outline: 'text-[var(--color-text)] dark:text-[var(--color-text)] border-[var(--color-border)] dark:border-[var(--color-border)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)]',
          link: 'text-[var(--color-opsi-blue)] hover:text-[var(--color-opsi-deep-blue)] dark:text-[#6b98e8] dark:hover:text-[#8fb3f5]',
        },
        color: {
          neutral: 'text-[var(--color-text)] dark:text-[var(--color-text)]',
        }
      }
    },
    input: {
      slots: {
        root: 'w-full',
        base: 'bg-white dark:bg-[var(--color-surface)] border-[var(--color-border)] dark:border-[var(--color-border)] text-[var(--color-text)] dark:text-[var(--color-text)] placeholder-[var(--color-text-muted)] dark:placeholder-[var(--color-text-muted)] focus:border-[var(--color-opsi-blue)] focus:ring-[var(--color-opsi-blue)]/20',
      }
    },
    select: {
      slots: {
        base: 'bg-white dark:bg-[var(--color-surface)] border-[var(--color-border)] dark:border-[var(--color-border)] text-[var(--color-text)] dark:text-[var(--color-text)]',
      }
    },
    selectMenu: {
      slots: {
        base: 'bg-white dark:bg-[var(--color-surface)] border-[var(--color-border)] dark:border-[var(--color-border)] text-[var(--color-text)] dark:text-[var(--color-text)]',
        content: 'bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] dark:border-[var(--color-border)] shadow-lg rounded-lg',
        item: 'text-[var(--color-text)] dark:text-[var(--color-text)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)]',
        itemLeadingIcon: 'text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)]',
      }
    },
    toggle: {
      slots: {
        root: 'bg-[var(--color-border)] dark:bg-[var(--color-border)] data-[state=checked]:bg-[var(--color-opsi-blue)]',
        thumb: 'bg-white dark:bg-[var(--color-text)]',
      }
    },
    formGroup: {
      slots: {
        label: 'text-sm font-medium text-[var(--color-text)] dark:text-[var(--color-text)]',
      }
    },
    table: {
      slots: {
        root: 'bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden',
        thead: 'bg-[var(--color-surface)] dark:bg-[var(--color-background)]',
        th: 'text-[var(--color-text-muted)] dark:text-[var(--color-text-secondary)] text-xs font-medium uppercase px-4 py-3',
        td: 'text-[var(--color-text)] dark:text-[var(--color-text)] px-4 py-3',
        tr: 'hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)] transition-colors border-b border-[var(--color-border)] dark:border-[var(--color-border)] last:border-b-0',
      }
    },
    badge: {
      variants: {
        color: {
          primary: 'bg-[var(--color-opsi-blue)]/15 text-[var(--color-opsi-blue)] dark:bg-[var(--color-opsi-blue)]/25 dark:text-[#8fb3f5]',
          success: 'bg-[var(--color-opsi-success)]/15 text-[var(--color-opsi-success)] dark:bg-[var(--color-opsi-success)]/25 dark:text-[#4ade80]',
          warning: 'bg-[var(--color-opsi-warning)]/15 text-[var(--color-opsi-warning)] dark:bg-[var(--color-opsi-warning)]/25 dark:text-[#fbbf24]',
          error: 'bg-[var(--color-opsi-error)]/15 text-[var(--color-opsi-error)] dark:bg-[var(--color-opsi-error)]/25 dark:text-[#f87171]',
          neutral: 'bg-[var(--color-surface)] dark:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]',
        }
      }
    },
    dropdown: {
      slots: {
        content: 'bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] dark:border-[var(--color-border)] shadow-lg rounded-lg',
        item: 'text-[var(--color-text)] dark:text-[var(--color-text)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)]',
      }
    },
    tooltip: {
      slots: {
        content: 'bg-[var(--color-surface)] dark:bg-[var(--color-surface-hover)] text-[var(--color-text)] dark:text-[var(--color-text)] text-xs px-2 py-1 rounded shadow-lg border border-[var(--color-border)]',
      }
    },
    modal: {
      slots: {
        content: 'bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] dark:border-[var(--color-border)]',
        header: 'text-[var(--color-text)] dark:text-[var(--color-text)]',
        body: 'text-[var(--color-text)] dark:text-[var(--color-text)]',
      }
    },
    slideover: {
      slots: {
        content: 'bg-white dark:bg-[var(--color-surface)] border-l border-[var(--color-border)] dark:border-[var(--color-border)]',
        header: 'text-[var(--color-text)] dark:text-[var(--color-text)]',
        body: 'text-[var(--color-text)] dark:text-[var(--color-text)]',
      }
    }
  },
})
