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
    <b-card>
      <b-card-text v-if="logtype">
        {{ logResult }}
        <!-- <div
          v-for="(log, index) in filteredLog"
          :key="index"
          class="TableClientsDetails_Logs_Body_Text_Division"
          :class="{ Log_Invisible: !isLoglevelSmaller(log, loglevel) }"
          :style="{ 'background-color': index % 2 == 0 ? 'White' : 'snow' }"
        >
          <span
            v-if="index != 0"
            style="font-family: monospace;"
            :class="{
              Log_Color_Default: true,
              Log_Color_0: log.startsWith('[0]'),
              Log_Color_1: log.startsWith('[1]'),
              Log_Color_2: log.startsWith('[2]'),
              Log_Color_3: log.startsWith('[3]'),
              Log_Color_4: log.startsWith('[4]'),
              Log_Color_5: log.startsWith('[5]'),
              Log_Color_6: log.startsWith('[6]'),
              Log_Color_7: log.startsWith('[7]'),
              Log_Color_8: log.startsWith('[8]'),
              Log_Color_9: log.startsWith('[9]')
            }"
          >
            <small> ({{ index }})  {{ log }}</small>
          </span>
        </div> -->
      </b-card-text>
    </b-card>
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
    logtype: '',
    loglevel: 5,
    logResult: [],
    logrequest: {
      selectedClient: '',
      selectedLogType: ''
    },
    logTypes: [{ value: null, text: 'Select Log Type' }, 'bootimage', 'clientconnect', 'instlog', 'opsiconfd', 'userlogin']
  }),
  beforeMount () {
    if (this.logtype) { this.getLog(this.id, this.logtype) }
  },
  methods: {
    getLog (id: string, logtype: string) {
      this.logrequest.selectedClient = id
      this.logrequest.selectedLogType = logtype
      this.$axios.post('/api/opsidata/log', this.logrequest)
        .then((response) => {
          this.logResult = response.data.result
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
          this.logResult = error
        })
    } // end getLog
  }
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
