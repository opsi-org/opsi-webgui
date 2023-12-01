<template>
  <div>
    {{ fetchedData }}
  </div>
</template>
<script setup lang="tsx">
import { useNotification } from '~/composables/mixins/useComponent';
const $t = useI18n().t
let fetchedData = ref<Array<any>>([])
const props = defineProps({
  id: { type: String, default: 'notejeena.uib.local' }
})

onMounted(async ()=> await fetch())

async function fetch() {
  const {data, error} = await useApiGETBody(`/opsidata/servers?servers=[${props.id}]`)
  if (error) {
    console.log(error)
    useNotification().error(error)
    return
  }
  console.log('Fetchresult data', data)
  fetchedData = data
}
</script>
