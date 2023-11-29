<template>
  <Story :layout="{ type: 'grid' }">
    <Variant title="short (default)">
      <ButtonBTNClearSelection/>
    </Variant>
    <Variant title="long">
      <ButtonBTNClearSelection :short="false" :showLabel="true" />
    </Variant>
    <Variant title="long label">
      <ButtonBTNClearSelection :short="false" :showLabel="true" label="custom label"/>
    </Variant>
  </Story>
</template>
