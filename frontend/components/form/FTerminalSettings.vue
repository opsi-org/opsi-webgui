<template>
  <div v-if="isMobile" class="m-2" data-testid="FTerminalSettings">
    <FormrowFRRow :disabled="disabled" class="block" :label="$t('table.fields.terminalId')" type="input" data-type="string" v-model="modelTerminalId" />
    <FormrowFRRow :disabled="disabled" class="block" :label="$t('table.fields.terminalChannel')" type="input" data-type="string" v-model="modelTerminalChannel" />
    <FormrowFRRow>
        <template #value>
          <el-button :disabled="disabled" type="primary" @click="emit('click-connect')">{{ $t('button.reconnect') }}</el-button>
          <el-button :disabled="disabled" type="primary" @click="emit('click-disconnect')"> $t('button.disconnect')</el-button>
        </template>
      </FormrowFRRow>
  </div>
  <el-form v-else class="p-2" data-testid="FTerminalSettings">
      <FormrowFRRow :disabled="disabled" label-width="200px" :label="$t('table.fields.terminalId')" type="input" data-type="string" v-model="modelTerminalId" />
      <FormrowFRRow :disabled="disabled" label-width="200px" :label="$t('table.fields.terminalChannel')" type="input" data-type="string" v-model="modelTerminalChannel" />
      <FormrowFRRow label-width="200px">
        <template #value>
          <el-button :disabled="disabled" type="primary" @click="emit('click-connect')">{{ $t('button.reconnect') }}</el-button>
          <el-button :disabled="disabled" type="primary" @click="emit('click-disconnect')">{{ $t('button.disconnect') }}</el-button>
        </template>
      </FormrowFRRow>
    </el-form>
</template>

<script setup lang="ts">

const modelTerminalId = defineModel('terminalId', { required: true, type: String })
const modelTerminalChannel = defineModel('terminalChannel', { required: true, type: String })
const emit = defineEmits(['update:terminalId', 'update:terminalChannel', 'click-connect', 'click-disconnect'])

const props = defineProps({
  disabled: { type: Boolean, default: false }
})

const isMobile = ref(useMQ().isMobile)
watch(()=>useMQ().isMobile, ()=>{
  isMobile.value = useMQ().isMobile.value
}, {deep: true})
</script>