<template>
  <b-container fluid>
    <b-table :stacked="stacked" borderless :items="tableitems">
      <template #cell(opsiHostKey)="row">
        <b-input-group>
          <b-form-input v-model="row.item.opsiHostKey" size="sm" readonly :type="hideValue ? 'text': 'password' " />
          <b-button :pressed.sync="hideValue" size="sm">
            <b-icon v-if="hideValue" icon="eye-slash" />
            <b-icon v-else icon="eye" />
          </b-button>
        </b-input-group>
      </template>
      <template #cell()="row">
        <b-form-input v-model="row.value" size="sm" readonly />
      </template>
    </b-table>
  </b-container>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    tableitems: {
      type: Array,
      default () {
        return []
      }
    },
    stacked: {
      type: Boolean,
      default () {
        return false
      }
    }
  },
  data: () => ({
    hideValue: false
  })
})
</script>
