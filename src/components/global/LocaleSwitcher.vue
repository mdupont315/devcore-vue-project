<template>
  <div class="locale-switcher">
    🌐
   <select v-model="$i18n.locale" class="spcustom-locales">
       <option :value="locale.value" v-for="locale in locales" :key="locale.value">
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
  name: "locales-switcher",
  computed: {
    locales: {
      get: function() {
        var items = [];
        var annotedLabels = getSupportedLocales();
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