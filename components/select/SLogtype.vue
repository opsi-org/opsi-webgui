<template>
  <div>
    <label for="logtype" class="sr-only"> {{ $t('formselect.logtype') }} </label>
    <b-form-select
      id="logtype"
      v-model="type"
      class="logtype"
      data-testid="SLogtype"
      :options="logTypes"
      @change="$emit('update:logtype', type)"
    >
      <template #first>
        <b-form-select-option :value="null" disabled>
          -- {{ $t('formselect.logtype') }} --
        </b-form-select-option>
      </template>
    </b-form-select>
  </div>
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
.logtype{
  max-width: 150px;
  margin-right: 10px;
}
</style>
