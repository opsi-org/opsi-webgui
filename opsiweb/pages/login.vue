<template>
  <div class="container">
    <div>
      <h1 class="title">opsiweb</h1>
      <!-- <FormFLogin :configserver="opsiconfigserver" /> -->
      <FormFLogin :configserver="'opsiconfigserver'" />

    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
// import Cookie from 'js-cookie'
// import {mapGetters, mapMutations} from 'vuex'

export default Vue.extend({
  // auth: false,
  name:"login",
  async asyncData({ $axios }) {
    // let data = await $axios.$post('/api/user/opsiserver', {});
    // // if (this.isAuthenticated)
    // //   let data = await $axios.$post('/api/user/opsiserver', {});

    // return { opsiconfigserver:data.result}
  },
  methods:{
  }
})
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family:
    'Quicksand',
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  display: block;
  font-weight: 30;
  font-size: 50px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
