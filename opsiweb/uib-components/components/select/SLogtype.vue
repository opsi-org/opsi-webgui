<template>
  <div>
    <b-form-select
      id="logtype"
      v-model="type"
      size="sm"
      :aria-label="$t('form.logtype')"
      class="logtype"
      data-testid="SLogtype"
      :options="logTypes"
      @change="$emit('update:logtype', type)"
    >
      <template #first>
        <b-form-select-option :value="null" disabled>
          {{ t_fixed('keep-english.empty') }}
          {{ $t('form.logtype') }}
          {{ t_fixed('keep-english.empty') }}
        </b-form-select-option>
      </template>
    </b-form-select>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { Strings } from '../../mixins/strings'

@Component({ mixins: [Strings] })
export default class SLogtype extends Vue {
  logTypes: Array<string> = ['bootimage', 'clientconnect', 'instlog', 'opsiconfd', 'userlogin']
  type: string = 'instlog'
  t_fixed: any
}
</script>

<style>
.logtype.custom-select{
  width: var(--component-width) !important;
}
</style>
