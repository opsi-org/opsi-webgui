<script setup lang="ts">
  // import { useConfigserver } from '~/composables/mixins/useGet';
  // import { loginlogout } from '~/histoire/histoire-utils';
  // const store = ref<any>({ selectionDepots: [] })
  // async function init(data: any) {
  //   await loginlogout(data)
  //   await useConfigserver(true, store)
  // }
  const terminalId = ref<string>('f40dbaa4-dc9f-46c0-9dc5-186a87a3eee5')
  const terminalChannel = ref<string>('service:config:terminal')
  function connect() {}
  function disconnect() {}
</script>
<template>
  <Story>
    <!-- <Story :setup-app="init"> -->
    <Variant
      title="mobile-enabled"
      :meta="{ wrapperMobile: true }"
      responsive-disabled
    >
      <FormFTerminalSettings
        v-model:terminal-id="terminalId"
        v-model:terminal-channel="terminalChannel"
        :disabled="false"
        @click-connect="connect"
        @click-disconnect="disconnect"
      />
    </Variant>
    <Variant
      title="mobile-disabled"
      :meta="{ wrapperMobile: true }"
      responsive-disabled
    >
      <FormFTerminalSettings
        v-model:terminal-id="terminalId"
        v-model:terminal-channel="terminalChannel"
        :disabled="true"
        @click-connect="connect"
        @click-disconnect="disconnect"
      />
    </Variant>

    <Variant title="desktop-enabled">
      <FormFTerminalSettings
        v-model:terminal-id="terminalId"
        v-model:terminal-channel="terminalChannel"
        :disabled="false"
        @click-connect="connect"
        @click-disconnect="disconnect"
      />
    </Variant>
    <Variant title="desktop-disabled">
      <FormFTerminalSettings
        v-model:terminal-id="terminalId"
        v-model:terminal-channel="terminalChannel"
        :disabled="true"
        @click-connect="connect"
        @click-disconnect="disconnect"
      />
    </Variant>
  </Story>
</template>
