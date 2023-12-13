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


const selectedClient = ref('')
function changeId (id:string) {
  selectedClient.value = id
}
</script>
<template>
  <Story :setup-app="init">
    <!-- <Variant title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled>
      <LayoutLPageContent>
        <slot name="default">
          <ViewVClients :is-mobile="true"/>
        </slot>
        <slot name="default">
          <ViewVConfig :is-mobile="true"/>
        </slot>
      </LayoutLPageContent>
    </Variant> -->
    <Variant title="desktop" responsive-disabled>
      <LayoutLPageContent>
        <template #default>
          <ViewVClients :is-mobile="false" @change="changeId"/>
        </template>
        <template #page1>
          <ViewVConfig :is-child="true"  :id="selectedClient" type="clients" />
        </template>
      </LayoutLPageContent>
    </Variant>
  </Story>
</template>