<template>
  <b-container fluid>
    <b-table hover :items="tableitems">
      <template #cell(value)="row">
        <template v-if="row.item.property == 'opsiHostKey'">
          <b-input-group>
            <b-form-input v-model="row.item.value" readonly :type="hideValue ? 'text': 'password' " />
            <b-button :pressed.sync="hideValue">
              <b-icon v-if="hideValue" icon="eye-slash" />
              <b-icon v-else icon="eye" />
            </b-button>
          </b-input-group>
        </template>
        <!-- <template v-else-if="row.item.type == 'boolean'">
          <b-form-checkbox v-model="row.item.value" disabled>
            True
          </b-form-checkbox>
        </template>
        <template v-else-if="row.item.type == 'switch'">
          <b-form-checkbox v-model="row.item.value" switch disabled>
            ON
          </b-form-checkbox>
        </template> -->
        <b-form-input v-else v-model="row.item.value" readonly />
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
    }
  },
  data: () => ({
    hideValue: false
  })
})
</script>
