<template>
    <div class="onboarding-container">
        <v-container fluid class="pa-0 h-100">
            <v-row no-gutters class="h-100">
                <!-- Image Section -->
                <v-col
                    cols="12"
                    md="6"
                    class="bg-primary d-flex align-center justify-center onboarding-image"
                    style="min-height: 300px"
                >
                    <!-- Placeholder for the image you'll add -->
                    <div class="text-center">
                        <h2 class="text-h3 text-white mb-4">
                            {{ $t("onboarding.step1.imageTitle") }}
                        </h2>
                        <p class="text-h6 text-white">
                            {{ $t("onboarding.step1.imageSubtitle") }}
                        </p>
                    </div>
                </v-col>

                <!-- Form Section -->
                <v-col cols="12" md="6" class="d-flex align-center">
                    <v-container>
                        <v-row justify="center">
                            <v-col cols="12" sm="8" lg="6">
                                <h1 class="text-h4 mb-6">
                                    {{ $t("onboarding.step1.title") }}
                                </h1>

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
                                        :label="$t('onboarding.step1.name')"
                                        :rules="[rules.required]"
                                        variant="outlined"
                                        class="mb-4"
                                    ></v-text-field>

                                    <v-radio-group
                                        v-model="formData.gender"
                                        :label="$t('onboarding.step1.gender')"
                                        :rules="[rules.required]"
                                        class="mb-4"
                                    >
                                        <v-radio
                                            v-for="option in genderOptions"
                                            :key="option.value"
                                            :value="option.value"
                                            :label="$t(option.label)"
                                        ></v-radio>
                                    </v-radio-group>

                                    <v-radio-group
                                        v-model="formData.ordinationType"
                                        :label="$t('onboarding.step1.ordinationType')"
                                        :rules="[rules.required]"
                                        class="mb-6"
                                    >
                                        <v-radio
                                            value="novice"
                                            :label="$t('onboarding.step1.novice')"
                                        ></v-radio>
                                        <v-radio
                                            value="fully-ordained"
                                            :label="$t('onboarding.step1.fullyOrdained')"
                                        ></v-radio>
                                    </v-radio-group>

                                    <v-btn
                                        block
                                        color="primary"
                                        size="large"
                                        type="submit"
                                        :loading="loading"
                                        :disabled="loading"
                                    >
                                        {{ $t("onboarding.step1.continue") }}
                                    </v-btn>
                                </v-form>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useOnboardingStore } from "@/stores/onboarding";

interface OnboardingData {
    name: string;
    gender: string;
    ordinationType: "novice" | "fully-ordained" | undefined;
}

const router = useRouter();
const onboardingStore = useOnboardingStore();
const form = ref();
const loading = ref(false);
const error = ref("");

const formData = ref<OnboardingData>({
    name: "",
    gender: "",
    ordinationType: undefined
});

const genderOptions = [
    { value: "male", label: "onboarding.step1.male" },
    { value: "female", label: "onboarding.step1.female" },
    { value: "other", label: "onboarding.step1.other" }
];

const rules = {
    required: (v: string) => !!v || "Required"
};

const handleSubmit = async () => {
    const { valid } = await form.value.validate();
    if (!valid) return;

    loading.value = true;
    error.value = "";

    try {
        // Store step 1 data
        onboardingStore.updateStep1(formData.value);
        router.push("/onboarding/step2");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        error.value = err.message || "An error occurred";
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.onboarding-container {
    height: 100vh;
    overflow-y: auto;
}

@media (max-width: 959px) {
    .onboarding-image {
        height: 300px;
    }
}

@media (min-width: 960px) {
    .onboarding-container {
        overflow: hidden;
    }
}
</style>
