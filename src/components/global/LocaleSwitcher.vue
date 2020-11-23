<template>
  <div class="locale-switcher">
    🌐
   <select v-model="$i18n.locale" class="spcustom-locales">
       <option v-for="locale in locales" :key="locale.value" :value="locale.value">
        {{locale.text}}
      </option>
    </select>
  </div>
</template>
<script>
import {
    getSupportedLocales
} from '../../lib/utils';

export default {
  name: "LocalesSwitcher",
  computed: {
    locales: {
      get() {
        const items = [];
        const annotedLabels = getSupportedLocales();
         annotedLabels.forEach(element => {
          items.push({
            text: element.name,
            value: element.code,
          })
        });
        return items;
      }
    }
  }
  

}
</script>