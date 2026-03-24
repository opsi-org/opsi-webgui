import { defineStore } from 'pinia'

export const useMessageBusStore = defineStore('messageBus', {
  persist: {
    key: 'opsi-webgui-messagebus',
    storage: localStorage,
    pick: ['autoRefresh'],
  },
  state: () => ({
    retries: 0,
    retriesMax: 3,
    bus: undefined as WebSocket | undefined,
    terminal: undefined as WebSocket | undefined,
    lastMsg: undefined as unknown,
    autoRefresh: true,
    changesDetected: false,
    lastEventType: '',
    lastEventDescription: '',
    lastEventTime: 0,
  }),
  getters: {
    isConnected: (s) => s.bus?.readyState === 1,
  },
  actions: {
    reset() {
      this.bus = undefined
      this.terminal = undefined
      this.lastMsg = undefined
      this.retries = 0
    },
    setBus(bus?: WebSocket) {
      this.bus = bus
    },
    setTerminal(terminal?: WebSocket) {
      this.terminal = terminal
    },
    setLastMsg(msg: unknown) {
      this.lastMsg = msg
    },
    incRetries() {
      this.retries += 1
    },
    resetRetries() {
      this.retries = 0
    },
    setAutoRefresh(val: boolean) {
      this.autoRefresh = val
    },
    setChangesDetected(val: boolean) {
      this.changesDetected = val
    },
    setLastEvent(type: string) {
      this.lastEventType = type
      this.lastEventTime = Date.now()
      this.changesDetected = true
    },
  },
})
