<script setup lang="ts">
  const showModal = ref(true)
  const events = ref(['showpopup', 'ondemand', 'reboot', 'rename', 'delete'])
</script>

<template>
  <Story :layout="{ type: 'grid', width: '50%' }">
    <!-- <Variant
      title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled> -->
    <Variant v-for="event in events" :key="event" :title="'desktop-' + event">
      <ModalMClientEvents
        v-if="showModal"
        v-model="showModal"
        id="dummy-client-id.domain.local"
        :event="event"
        :modal="false"
        class="relative"
      />
    </Variant>
  </Story>
</template>
