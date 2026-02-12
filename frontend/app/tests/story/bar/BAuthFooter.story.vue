<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <Story>
    <Variant title="desktop">
      <BarBAuthFooter />
    </Variant>
    <Variant title="mobile" :meta="{ wrapperMobile: true }" responsive-disabled>
      <BarBAuthFooter />
    </Variant>
  </Story>
</template>
