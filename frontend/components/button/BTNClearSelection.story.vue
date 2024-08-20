<template>
  <Story :layout="{ type: 'grid' }">
    <Variant title="short (default label)">
      <ButtonBTNClearSelection />
    </Variant>
    <Variant title="long (default label)">
      <ButtonBTNClearSelection :short="false" :showLabel="true" />
    </Variant>
    <Variant title="long (custom label)">
      <ButtonBTNClearSelection :short="false" :showLabel="true" label="custom label" />
    </Variant>
  </Story>
</template>
