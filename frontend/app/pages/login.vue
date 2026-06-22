<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  LoginPage - Authentication page.
-->
<template>
  <div>
    <LoginMainForm />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t: $t } = useI18n()
useHead({ title: () => `${$t('auth.login')} - opsi-WebGUI` })
</script>
