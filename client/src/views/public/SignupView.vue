<template>
    <v-container class="fill-height">
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="6" lg="4">
                <v-card class="mx-auto">
                    <v-card-title class="text-center text-h4 py-4">
                        {{ $t(`auth.signup.${userType}.title`) }}
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
                                v-model="formData.name"
                                :label="$t('auth.form.name')"
                                :rules="[rules.required]"
                                variant="outlined"
                                class="mb-4"
                            ></v-text-field>

                            <v-text-field
                                v-model="formData.email"
                                :label="$t('auth.form.email')"
                                type="email"
                                :rules="[rules.required, rules.email]"
                                variant="outlined"
                                class="mb-4"
                            ></v-text-field>

                            <v-text-field
                                v-model="formData.password"
                                :label="$t('auth.form.password')"
                                :rules="[rules.required, rules.password]"
                                type="password"
                                variant="outlined"
                                class="mb-4"
                            ></v-text-field>

                            <v-text-field
                                v-model="formData.confirmPassword"
                                :label="$t('auth.form.confirmPassword')"
                                :rules="[rules.required, rules.passwordMatch]"
                                type="password"
                                variant="outlined"
                                class="mb-6"
                            ></v-text-field>

                            <v-btn
                                block
                                color="primary"
                                size="large"
                                type="submit"
                                :loading="loading"
                                :disabled="loading"
                            >
                                {{ $t("auth.signup.submit") }}
                            </v-btn>
                        </v-form>

                        <div class="text-center mt-4">
                            <router-link to="/signin" class="text-decoration-none">
                                {{ $t("auth.signup.signin") }}
                            </router-link>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getAuthErrorMessage } from "@/utils/errorMessages";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const form = ref();
const loading = ref(false);
const error = ref("");

const userType = computed(() => (route.query.type as "patron" | "monastic") || "patron");

const formData = ref({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
});

const rules = {
    required: (v: string) => !!v || "Required",
    email: (v: string) => /.+@.+\..+/.test(v) || "Invalid email",
    password: (v: string) => v.length >= 8 || "Min 8 characters",
    passwordMatch: (v: string) => v === formData.value.password || "Passwords must match"
};

const handleSubmit = async () => {
    const { valid } = await form.value.validate();
    if (!valid) return;

    if (formData.value.password !== formData.value.confirmPassword) {
        error.value = "Passwords do not match";
        return;
    }

    error.value = "";
    loading.value = true;

    try {
        await authStore.signup(
            formData.value.email,
            formData.value.password,
            userType.value,
            formData.value.name
        );

        if (userType.value === "monastic") {
            router.push("/onboarding/step1");
        } else {
            router.push("/home");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        error.value = getAuthErrorMessage(err);
        // Log error for monitoring (you might want to use a proper logging service)
        console.error("Signup error:", err);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    if (!["patron", "monastic"].includes(userType.value)) {
        router.replace("/");
    }
});
</script>
