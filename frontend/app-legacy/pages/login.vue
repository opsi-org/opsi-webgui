<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div>
    <FormFLogin />
  </div>
</template>

<script setup>
  import { useNotification } from '~/composables/mixins/useComponent'

  definePageMeta({ layout: 'auth' })

  const $t = useI18n().t
  const query = computed(() => useRoute().query || undefined)

  onMounted(() => {
    if (query.value?.expired === 'true') {
      storeAuth().setErrorLoggedOutShown(false)
      useNotification().notifyWarning({
        title: $t('message.sessionExpired'),
        message: $t('message.youHaveBeenLoggedOut'),
        duration: 5000,
      })
      useRouter().replace({ query: { ...query.value, expired: undefined } })
    }
  })
</script>
