<template>
  <div>
    <h3>Test two column</h3>
    <b-row>
      <b-col>
        <NuxtLink to="/testtwocolumn/testchild1" :class="{'nuxt-link-active': isRouteActive('/testtwocolumn/testchild1')}">
          Show Child
        </NuxtLink>
        <b-table striped hover :items="items" />
      </b-col>
      <b-col v-if="secondColumnOpened">
        <NuxtChild />
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data () {
    return {
      secondColumnOpened: false,
      items: [
        { age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
        { age: 21, first_name: 'Larsen', last_name: 'Shaw' },
        { age: 89, first_name: 'Geneva', last_name: 'Wilson' },
        { age: 38, first_name: 'Jami', last_name: 'Carney' }
      ]
    }
  },
  methods: {
    isRouteActive (id: string) {
      if (this.$route.path.includes(id)) {
        this.secondColumnOpened = true
      } else {
        this.secondColumnOpened = false
      }
    }
  }
})
</script>
