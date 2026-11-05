export type ButtonIntent = 'command' | 'confirm' | 'dismiss' | 'destructive' | 'inline' | 'toggle'

export function buttonAppearance(intent: ButtonIntent, active = false) {
  switch (intent) {
    case 'command':
      return { color: 'primary', variant: 'outline' } as const
    case 'confirm':
      return { color: 'primary', variant: 'solid' } as const
    case 'destructive':
      return { color: 'error', variant: 'ghost' } as const
    case 'toggle':
      return { color: active ? 'primary' : 'neutral', variant: active ? 'soft' : 'ghost' } as const
    default:
      return { color: 'neutral', variant: 'ghost' } as const
  }
}
