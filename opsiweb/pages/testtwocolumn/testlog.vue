<template>
  <div>
    <BarBPageHeader :title="'Log - ' + id" closeroute="/testtwocolumn">
      <template #filter>
        <b-form-input class="filter_input" placeholder="Filter" />
      </template>
      <template #log>
        <b-form-select
          v-model="logtype"
          class="logtype_select"
          :options="logTypes"
        />
        <b-form-spinbutton
          v-model="loglevel"
          size="sm"
          class="loglevel_spinbutton"
          min="0"
          max="8"
          step="1"
          inline
        />
      </template>
    </BarBPageHeader>
    <!-- <TableTDefault :tableitems="items" /> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    id: {
      type: String,
      default () {
        return ''
      }
    }
  },
  data: () => ({
    logtype: null,
    loglevel: 5,
    logTypes: [{ value: null, text: 'Select Log Type' }, 'bootimage', 'clientconnect', 'instlog', 'opsiconfd', 'userlogin']
  })
})
</script>

<style>
.filter_input{
  min-width: 100px !important;
}
.logtype_select{
  min-width: 100px !important;
}
.loglevel_spinbutton{
  min-width: 150px !important;
}
</style>
