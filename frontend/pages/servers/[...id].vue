<template>
  <div>
      <!-- META: {{ route.meta.title  }} <br /> -->
      Only server: {{route.name}} <br />
      Ids: {{route.params.id}} <br />
      <br />
    <el-button class="float-right" @click="useRouter().push('/servers/')">X</el-button>
    <ViewVConfig v-if="route.params.id[0] === 'config'" :type="type" :id="id" :is-child="false"/>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const type = 'depots'

// const id = useState('id', () => undefined)
// onMounted(() => { reloads.value++ })

const id = ref(useRoute().params.id)
</script>