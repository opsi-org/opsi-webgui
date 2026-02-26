export default defineAppConfig({
  ui: {
    colors: {
      // Use custom opsi colors - defined via CSS variables in main.css
      primary: 'blue',
      neutral: 'zinc',
      success: 'emerald',
      warning: 'amber',
      error: 'red',
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
      }
    },
    input: {
      slots: {
        root: 'w-full',
        base: 'bg-white dark:bg-[var(--color-surface)] border-[var(--color-border)] dark:border-[var(--color-border)] text-[var(--color-text)] dark:text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-opsi-blue)] focus:ring-[var(--color-opsi-blue)]/20',
      }
    },
    select: {
      slots: {
        base: 'bg-white dark:bg-[var(--color-surface)] border-[var(--color-border)] dark:border-[var(--color-border)] text-[var(--color-text)] dark:text-[var(--color-text)]',
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
        th: 'text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)] text-xs font-medium uppercase px-4 py-3',
        td: 'text-[var(--color-text)] dark:text-[var(--color-text)] px-4 py-3',
        tr: 'hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)] transition-colors',
      }
    },
    badge: {
      variants: {
        color: {
          primary: 'bg-[var(--color-opsi-blue)]/15 text-[var(--color-opsi-blue)]',
          success: 'bg-[var(--color-opsi-success)]/15 text-[var(--color-opsi-success)]',
          warning: 'bg-[var(--color-opsi-warning)]/15 text-[var(--color-opsi-warning)]',
          error: 'bg-[var(--color-opsi-error)]/15 text-[var(--color-opsi-error)]',
        }
      }
    },
    dropdown: {
      slots: {
        content: 'bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] dark:border-[var(--color-border)] shadow-lg rounded-lg',
        item: 'text-[var(--color-text)] dark:text-[var(--color-text)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)]',
      }
    }
  },
})
