import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import "ol/ol.css";
import { Quasar } from "quasar";
import "@quasar/extras/material-icons/material-icons.css";
import "quasar/src/css/index.sass";

const app = createApp(App);
app.use(vuetify);
app.use(Quasar, {
  plugins: {},
});
app.mount("#app");
