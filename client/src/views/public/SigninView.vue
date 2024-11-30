<template>
    <v-container class="fill-height">
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="6" lg="4">
                <v-card class="mx-auto">
                    <v-card-title class="text-center text-h4 py-4">
                        {{ $t("auth.signin.title") }}
                    </v-card-title>

                    <v-card-text>
                        <v-form @submit.prevent="handleSubmit" ref="form">
                            <v-alert
                                v-if="error"
                                type="error"
                                variant="tonal"
                                closable
                                class="mb-4"
                            >
                                {{ error }}
                            </v-alert>

                            <v-text-field
                                v-model="formData.email"
                                :label="$t('auth.form.email')"
                                type="email"
                                :rules="[rules.required, rules.email]"
                                variant="outlined"
                                class="mb-4"
                                :error-messages="emailError"
                                @input="clearErrors"
                            ></v-text-field>

                            <v-text-field
                                v-model="formData.password"
                                :label="$t('auth.form.password')"
                                :rules="[rules.required]"
                                type="password"
                                variant="outlined"
                                class="mb-6"
                                :error-messages="passwordError"
                                @input="clearErrors"
                            ></v-text-field>

                            <v-btn
                                block
                                color="primary"
                                size="large"
                                type="submit"
                                :loading="loading"
                                :disabled="loading"
                            >
                                {{ $t("auth.signin.submit") }}
                            </v-btn>
                        </v-form>

                        <div class="text-center mt-4">
                            <router-link to="/signup" class="text-decoration-none">
                                {{ $t("auth.signin.signup") }}
                            </router-link>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getAuthErrorMessage } from "@/utils/errorMessages";

const router = useRouter();
const authStore = useAuthStore();
const form = ref();
const loading = ref(false);
const error = ref("");
const emailError = ref("");
const passwordError = ref("");

const formData = ref({
    email: "",
    password: ""
});

const rules = {
    required: (v: string) => !!v || "Required",
    email: (v: string) => /.+@.+\..+/.test(v) || "Invalid email"
};

const clearErrors = () => {
    error.value = "";
    emailError.value = "";
    passwordError.value = "";
};

const handleSubmit = async () => {
    const { valid } = await form.value.validate();
    if (!valid) return;

    clearErrors();
    loading.value = true;

    try {
        await authStore.login(formData.value.email, formData.value.password);

        if (authStore.needsOnboarding) {
            router.push("/onboarding/step1");
        } else if (authStore.isMonastic && !authStore.monasticProfile?.isApproved) {
            router.push("/pending");
        } else {
            router.push("/home");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        const errorMsg = getAuthErrorMessage(err);

        // Set specific field errors if applicable
        if (err.code === "auth/user-not-found") {
            emailError.value = errorMsg;
        } else if (err.code === "auth/wrong-password") {
            passwordError.value = errorMsg;
        } else {
            error.value = errorMsg;
        }

        console.error("Signin error:", err);
    } finally {
        loading.value = false;
    }
};
</script>
