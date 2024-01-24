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
