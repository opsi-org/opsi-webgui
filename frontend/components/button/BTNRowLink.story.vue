<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<script setup lang="ts"></script>
<template>
  <Story :layout="{ type: 'grid' }">
    <Variant title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled>
      <ButtonBTNRowLink />
    </Variant>
    <Variant title="desktop" responsive-disabled>
      <ButtonBTNRowLink />
    </Variant>
  </Story>
</template>
