<template>
  <div>
    <!-- <nuxt-link :to="localePath('index')">{{ $t('home') }}</nuxt-link> <br />
<nuxt-link :to="localePath('/')">{{ $t('home') }}</nuxt-link><br />
<nuxt-link :to="localePath('index', 'en')">Homepage in English</nuxt-link><br /> -->
    <form>
      <!-- Messages: {{ $i18n.messages }} <br /> -->
      <label for="locale-select">{{ $t('language') }}: </label>
      <select id="locale-select" v-model="$i18n.locale">
        <option value="en">en</option>
        <option value="de">de</option>
      </select>
    </form>
  </div>
</template>

<script setup>
// const { locale } = useI18n()
</script>
