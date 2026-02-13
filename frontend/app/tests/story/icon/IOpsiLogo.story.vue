<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <Story :layout="{ type: 'grid' }">
    <Variant title="OpsiLogo-default">
      <IconIOpsiLogo />
    </Variant>
    <Variant title="OpsiLogo-short">
      <IconIOpsiLogo :short="true" />
    </Variant>
    <Variant title="OpsiLogo-not-short">
      <IconIOpsiLogo :short="false" />
    </Variant>
    <Variant title="OpsiLogo-light">
      <IconIOpsiLogo :light="true" />
    </Variant>
    <Variant title="OpsiLogo-white">
      <IconIOpsiLogo :white="true" />
    </Variant>
  </Story>
</template>
