<template>
  <b-form-select v-model="type" :options="logTypes" @change="$emit('update:logtype', type)">
    <template #first>
      <b-form-select-option :value="null" disabled>
        -- Please select a Log type --
      </b-form-select-option>
    </template>
  </b-form-select>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class SLogtype extends Vue {
  logTypes: Array<string> = ['bootimage', 'clientconnect', 'instlog', 'opsiconfd', 'userlogin']
  type: string = 'opsiconfd'
}
</script>

<style>

</style>
