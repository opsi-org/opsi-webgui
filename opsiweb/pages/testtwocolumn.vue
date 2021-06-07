<template>
  <GridGTwoColumnLayout breadcrumb="Test two column Parent" :showchild="secondColumnOpened">
    <template #parent>
      <NuxtLink to="/testtwocolumn/testlog" :class="{'nuxt-link-active': isRouteActive('/testtwocolumn/testlog')}">
        Show Child
      </NuxtLink>
      <CollapseCTable title="Category1" :tableitems="items" />
      <CollapseCTable title="Category2" :tableitems="childItems" />
      <span style="color:blue">
        Note: This page is only for test purpose. Use similar nested route structure for Depots, Clients and Products
      </span>
    </template>
    <template #child>
      <NuxtChild :id="childId" />
    </template>
  </GridGTwoColumnLayout>
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
      ],
      childId: 'anna-vm-24001.uib.local'
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
