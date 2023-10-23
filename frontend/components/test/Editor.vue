<template>
  <div>
    {{ $i18n.locale }}
    {{ $t('message.success.title') }}
    {{ (settings.theme === 'light') ? 'vs-light': 'vs-dark' }}
    <div id="editor" style="height: 100vh"></div>
  </div>
</template>
<script lang="js" setup>
// import { monaco } from '@/monaco';
import { onMounted } from 'vue'
import * as monaco from 'monaco-editor'
const settings = useSettingsStore()

const optionsEditor = {
  value: 'const foo = "bar"\nconst bar = fooo\n// testing code comment.js comment comment.css',
  language: 'javascript'
}
const optionsTheme = {
  inherit: true, // can also be false to completely replace the builtin rules
  // rules: [
  //   // { token: 'const', foreground: 'aaaaa', fontStyle: 'italic underline' },
  //   { token: 'comment', foreground: 'ffa500', fontStyle: 'italic underline' },
  //   { token: 'comment.js', foreground: '008800', fontStyle: 'bold' },
  //   { token: 'comment.css', foreground: '0000ff' } // will inherit fontStyle from `comment` above
  // ],
  // colors: {
  //   'editor.background': '#000000',
  //   'editor.foreground': '#ffffff',
  // }
}
onMounted (() => {
  setTheme((settings.theme === 'light') ? 'vs-light': 'vs-dark');
});

watch(settings.theme, (newTheme, oldTheme) => {
  console.log('Editor: theme changed ', newTheme)
  nextTick(() => {
    setTheme((newTheme == 'light') ? 'vs-light' : 'vs-dark');
  })
  // reloadNuxtApp()
});

function setTheme (t='vs-light', options=optionsEditor, toptions=optionsTheme) {
  monaco?.editor.create(document.getElementById('editor'), options);
  monaco.editor.setTheme(t, toptions)
}

</script>

<style>
/* .monacoeditor {
  min-height: 400px;
} */
</style>