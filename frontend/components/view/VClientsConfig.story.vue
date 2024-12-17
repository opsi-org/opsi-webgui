<script setup lang="ts">
  import { loginlogout } from '~/histoire/histoire-utils'
  import { useConfigserver } from '~/composables/mixins/useGet'

  const store = ref({
    selectionDepots: [] as Array<string>,
    selectionClients: [] as Array<string>,
  })
  async function init(data: any) {
    await loginlogout(data)
    await useConfigserver(true, store)
  }

  function changeId(id: string) {
    store.value.selectionClients = [id]
  }
</script>
<template>
  <Story :setup-app="init">
    <Variant title="desktop" responsive-disabled>
      <LayoutLPageContent>
        <template #default>
          <ViewVClients :is-mobile="false" @change="changeId" />
        </template>
        <template #page1>
          <ViewVHostConfig
            :is-child="true"
            :id="store.selectionClients[0]"
            type="clients"
          />
        </template>
      </LayoutLPageContent>
    </Variant>
  </Story>
</template>
