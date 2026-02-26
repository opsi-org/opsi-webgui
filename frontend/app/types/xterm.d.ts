declare module '@xterm/xterm' {
  export class Terminal {
    constructor(options?: ITerminalOptions)
    open(parent: HTMLElement): void
    write(data: string | Uint8Array, callback?: () => void): void
    writeln(data: string | Uint8Array, callback?: () => void): void
    onData(listener: (data: string) => void): IDisposable
    onResize(listener: (size: { cols: number; rows: number }) => void): IDisposable
    loadAddon(addon: ITerminalAddon): void
    dispose(): void
    clear(): void
    cols: number
    rows: number
  }

  export interface ITerminalOptions {
    cursorBlink?: boolean
    fontSize?: number
    fontFamily?: string
    theme?: ITheme
    rows?: number
    cols?: number
    scrollback?: number
    convertEol?: boolean
    disableStdin?: boolean
    allowTransparency?: boolean
    tabStopWidth?: number
    rightClickSelectsWord?: boolean
  }

  export interface ITheme {
    foreground?: string
    background?: string
    cursor?: string
    cursorAccent?: string
    selectionBackground?: string
    selectionForeground?: string
    black?: string
    red?: string
    green?: string
    yellow?: string
    blue?: string
    magenta?: string
    cyan?: string
    white?: string
    brightBlack?: string
    brightRed?: string
    brightGreen?: string
    brightYellow?: string
    brightBlue?: string
    brightMagenta?: string
    brightCyan?: string
    brightWhite?: string
  }

  export interface IDisposable {
    dispose(): void
  }

  export interface ITerminalAddon {
    activate(terminal: Terminal): void
    dispose(): void
  }
}

declare module '@xterm/addon-fit' {
  import type { Terminal, ITerminalAddon } from '@xterm/xterm'

  export class FitAddon implements ITerminalAddon {
    activate(terminal: Terminal): void
    dispose(): void
    fit(): void
    proposeDimensions(): { cols: number; rows: number } | undefined
  }
}

declare module '@xterm/addon-web-links' {
  import type { Terminal, ITerminalAddon } from '@xterm/xterm'

  export interface ILinkHandler {
    urlRegex?: RegExp
    handleLink?: (event: MouseEvent, text: string) => void
  }

  export class WebLinksAddon implements ITerminalAddon {
    constructor(handler?: ILinkHandler)
    activate(terminal: Terminal): void
    dispose(): void
  }
}

declare module '@xterm/addon-search' {
  import type { Terminal, ITerminalAddon } from '@xterm/xterm'

  export interface ISearchOptions {
    regex?: boolean
    wholeWord?: boolean
    caseSensitive?: boolean
    incremental?: boolean
  }

  export class SearchAddon implements ITerminalAddon {
    activate(terminal: Terminal): void
    dispose(): void
    findNext(term: string, searchOptions?: ISearchOptions): boolean
    findPrevious(term: string, searchOptions?: ISearchOptions): boolean
    clearDecorations(): void
  }
}
