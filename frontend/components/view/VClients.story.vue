<script setup lang="ts">
import { loginlogout } from '~/histoire/histoire-utils'
import { useConfigserver } from '~/composables/mixins/useGet'

async function init(data: any) {
  await loginlogout(data)
  const selection = await useConfigserver().getOpsiConfigServer()
  if (selection){
    console.log('opsiserver', selection)
    storeSelections().pushToSelectionDepots(selection)
  } else {
    console.log('could find opsiserver')
  }
  // const store = storeCache().opsiconfigserver
  // console.log('inside store', store)
  const store = storeSelections().selectionDepots
  console.log('inside store', store)
}
</script>
<template>
  <Story :setup-app="init">
    <Variant title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled>
      <ViewVClients :is-mobile="true"/>
    </Variant>
    <Variant title="desktop" responsive-disabled>
      <ViewVClients :is-mobile="false"/>
    </Variant>
  </Story>
</template>