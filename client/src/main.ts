// src/main.ts
import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n/index";
import { useAuthStore } from "@/stores/auth";

// Initialize Firebase first
import "@/firebase/config";

const app = createApp(App);
const pinia = createPinia();

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: "light"
    }
});

app.use(pinia);

// Initialize auth store after pinia but before router
const authStore = useAuthStore();
await authStore.initializeAuth();

app.use(router);
app.use(i18n);
app.use(vuetify);

app.mount("#app");
