import { createI18n } from "vue-i18n";
import en from "./en";
import es from "./es";

const messages = { en, es };

const language = window.location.hostname.includes("cuencodeofrendas") ? "es" : "en";

const i18n = createI18n({
    locale: language,
    fallbackLocale: "en",
    messages
});

export const t = (key: string) => i18n.global.t(key);
export default i18n;
