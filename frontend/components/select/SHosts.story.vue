<script setup lang="ts">
import { useConfigserver } from '~/composables/mixins/useGet';
import { loginlogout } from '~/histoire/histoire-utils';
const selection = ref<string>('')

async function init(data: any) {
  await loginlogout(data)
  selection.value = await useConfigserver().getOpsiConfigServer() as string
  if (selection.value){
    console.log('opsiserver', selection.value)
    storeSelections().pushToSelectionDepots(selection.value)
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
      <SelectSHosts :id="selection" @change="(s:string)=>{console.log(s)}"/>
    </Variant>
  </Story>
</template>
