<template>
  <div>
    {{ debugText }}
    <br />

    <IconIDetails content="depot-wo-prod" variant="warn" data-testid="depot-notall" />
    <IconIDetails content="depot-unequal" variant="warn" data-testid="depot-unequal" />
    <!--<IconIDetails content="depot-equal" variant="warn" />-->
    <br />
    <IconIDetails content="client-outdated" variant="danger" data-testid="client-outdated" />
    <IconIDetails content="client-outdated" variant="warn" data-testid="client-unequal" />
    <br />
    <IconIDetails content="unequal" variant="danger" data-testid="danger-icon-unequal" />
    <IconIDetails
      :content="useIcons().x"
      variant="danger"
      data-testid="danger-icon-failed"
      content-is-icon
    />
    <br />
    <IconIDetails content="unequal" variant="warn" data-testid="warn-icon-unequal" />
    <IconIDetails content="unknown" variant="warn" data-testid="warn-text-unknown" />
    <br />
    <!--<IconIDetails content="equal" variant="success" data-testid="success-equal" />-->
    <IconIDetails
      :content="useIcons().productActionResultSuccessful"
      variant="success"
      data-testid="success-icon-success"
      content-is-icon
    />
    <IconIDetails content="unequal" variant="success" data-testid="success-icon-unequal" />
    <IconIDetails content="installed" variant="success" data-testid="success-text-installed" />
  </div>
</template>

<script setup lang="ts">
  const debugText =
    'This page is for debugging the product related table cells and creating screenshots of components which may not be created by dummy data.'
</script>
