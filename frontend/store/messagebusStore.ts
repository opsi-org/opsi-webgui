import { defineStore } from 'pinia'
import { computed } from 'vue'


export const storeMBus = defineStore('mbus', () => {
  // need to return the states / getters/ actions in the end of the setup
  // states
  let _bus: WebSocket|undefined = undefined
  let _busterminal: WebSocket|undefined = undefined
  let _bus_last_msg: any = undefined

  // getter
  const bus = computed(() => _bus)
  const busterminal = computed(() => _busterminal)
  const wsBusMsg = computed(() => _bus_last_msg)

  // actions

  function setBus (bus: WebSocket|undefined) {
    _bus = bus
  }

  function setBusTerminal (bus: WebSocket|undefined) {
    _busterminal = bus
  }

  function setBusLastMsg (obj: any) {
    _bus_last_msg = obj
  }

  return {
    /* states */
    /* getters */ bus, busterminal, wsBusMsg
    /* actions */ , setBus, setBusTerminal, setBusLastMsg
  }
}, { persist: true } as any)
