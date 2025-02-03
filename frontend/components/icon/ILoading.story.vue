<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <Story :layout="{ type: 'grid' }">
    <Variant title="ILoading-default">
      <IconILoading />
    </Variant>
    <Variant title="ILoading-small">
      <IconILoading :small="true" />
    </Variant>
  </Story>
</template>

<script lang="ts" setup></script>
