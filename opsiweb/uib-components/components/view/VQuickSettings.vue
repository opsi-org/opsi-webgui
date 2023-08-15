<template>
  <div data-testid="VQuickSettings" :class="'VQuickSettings '+ $mq">
    <b-row>
      <b-col>
        <DropdownDDLang v-once />
      </b-col>
      <b-col>
        <DropdownDDTheme v-once />
      </b-col>
      <b-col cols="6">
        <CheckboxCBQuickSave />
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component
export default class VQuickSettings extends Vue {
  $mq: any
}
</script>
