import type { FirebaseError } from "firebase/app";
import { useI18n } from "vue-i18n";

export const getAuthErrorMessage = (error: FirebaseError): string => {
    const { t } = useI18n();
    const errorCode = error.code;

    switch (errorCode) {
        case "auth/email-already-in-use":
            return t("errors.auth.emailInUse");
        case "auth/invalid-email":
            return t("errors.auth.invalidEmail");
        case "auth/operation-not-allowed":
            return t("errors.auth.operationNotAllowed");
        case "auth/weak-password":
            return t("errors.auth.weakPassword");
        case "auth/user-not-found":
            return t("errors.auth.userNotFound");
        case "auth/wrong-password":
            return t("errors.auth.wrongPassword");
        case "auth/too-many-requests":
            return t("errors.auth.tooManyRequests");
        default:
            return t("errors.auth.default");
    }
};
