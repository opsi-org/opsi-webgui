<template>
  <div>
    <form>
      <label for="locale-select">{{ $t('theme') }}: </label>
      <select id="locale-select" v-model="theme">
        <option value="light">light</option>
        <option value="dark">dark</option>
      </select>
    </form>
  </div>
</template>

<script setup>
const settings = useSettingsStore()
const theme = ref(settings.theme)

watch(theme, (newTheme, oldTheme) => {
  console.log('themes', oldTheme, newTheme)
  settings.changeTheme(newTheme)
});
</script>
