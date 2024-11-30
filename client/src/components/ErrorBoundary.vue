<template>
    <div>
        <v-dialog v-model="shouldShowError" persistent max-width="400">
            <v-card>
                <v-card-text class="pt-4">
                    {{ translatedErrorMessage }}
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <template v-if="authStore.uiError?.type === AuthErrorType.NETWORK_ERROR">
                        <v-btn color="primary" @click="retryLastAction">
                            {{ $t("errors.retry") }}
                        </v-btn>
                    </template>

                    <v-btn color="primary" @click="handleSignIn">
                        {{ $t("errors.signIn") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <slot></slot>

        <v-overlay v-model="isRecovering" class="align-center justify-center">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { AuthErrorType } from "@/types/errors";
import { t } from "@/i18n/index";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isRecovering = ref(false);

const isPrivateRoute = computed(() => {
    return route.matched.some((record) => !record.meta.public);
});

const shouldShowError = computed(() => !!authStore.uiError && isPrivateRoute.value);

const translatedErrorMessage = computed(() =>
    authStore.uiError ? t(authStore.uiError.message) : ""
);

const handleSignIn = async () => {
    try {
        isRecovering.value = true;
        authStore.uiError = null;
        await authStore.logout();
        router.push({ name: "signin" });
    } finally {
        isRecovering.value = false;
    }
};

const retryLastAction = async () => {
    try {
        isRecovering.value = true;
        authStore.uiError = null;
        await authStore.initializeAuth();
    } finally {
        isRecovering.value = false;
    }
};
</script>
