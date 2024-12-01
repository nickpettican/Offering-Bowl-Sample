<template>
    <div class="onboarding-container">
        <v-container fluid class="pa-0 h-100">
            <v-row no-gutters class="h-100">
                <!-- Image Section -->
                <v-col
                    cols="12"
                    md="6"
                    class="bg-secondary d-flex align-center justify-center onboarding-image"
                    style="min-height: 300px"
                >
                    <!-- Placeholder for the image you'll add -->
                    <div class="text-center">
                        <h2 class="text-h3 text-white mb-4">
                            {{ $t("onboarding.step2.imageTitle") }}
                        </h2>
                        <p class="text-h6 text-white">
                            {{ $t("onboarding.step2.imageSubtitle") }}
                        </p>
                    </div>
                </v-col>

                <!-- Form Section -->
                <v-col cols="12" md="6" class="d-flex align-center">
                    <v-container>
                        <v-row justify="center">
                            <v-col cols="12" sm="8" lg="6">
                                <h1 class="text-h4 mb-6">
                                    {{ $t("onboarding.step2.title") }}
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

                                    <v-menu v-model="dateMenu" :close-on-content-click="false">
                                        <template v-slot:activator="{ props }">
                                            <v-text-field
                                                v-model="formData.ordinationDate"
                                                :label="$t('onboarding.step2.ordinationDate')"
                                                :rules="[rules.required]"
                                                prepend-icon="mdi-calendar"
                                                readonly
                                                v-bind="props"
                                                variant="outlined"
                                                class="mb-4"
                                            ></v-text-field>
                                        </template>
                                        <v-date-picker
                                            v-model="formData.ordinationDate"
                                            @update:model-value="dateMenu = false"
                                        ></v-date-picker>
                                    </v-menu>

                                    <v-text-field
                                        v-model="formData.vowPreceptor"
                                        :label="$t('onboarding.step2.vowPreceptor')"
                                        :rules="[rules.required]"
                                        variant="outlined"
                                        class="mb-4"
                                    ></v-text-field>

                                    <v-select
                                        v-model="formData.tradition"
                                        :items="traditions"
                                        :label="$t('onboarding.step2.tradition')"
                                        :rules="[rules.required]"
                                        variant="outlined"
                                        class="mb-4"
                                    ></v-select>

                                    <v-text-field
                                        v-model="formData.school"
                                        :label="$t('onboarding.step2.school')"
                                        :rules="[rules.required]"
                                        variant="outlined"
                                        class="mb-4"
                                    ></v-text-field>

                                    <v-text-field
                                        v-model="formData.monastery"
                                        :label="$t('onboarding.step2.monastery')"
                                        :rules="[rules.required]"
                                        variant="outlined"
                                        class="mb-4"
                                    ></v-text-field>

                                    <v-select
                                        v-model="formData.lifestyle"
                                        :items="lifestyles"
                                        :label="$t('onboarding.step2.lifestyle')"
                                        :rules="[rules.required]"
                                        variant="outlined"
                                        class="mb-6"
                                    ></v-select>

                                    <v-btn
                                        block
                                        color="primary"
                                        size="large"
                                        type="submit"
                                        :loading="loading"
                                        :disabled="loading"
                                    >
                                        {{ $t("onboarding.step2.submit") }}
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
    ordinationDate: string;
    vowPreceptor: string;
    tradition: string;
    school: string;
    monastery: string;
    lifestyle: "anchorite" | "cenobite" | "gyrovague" | undefined;
}

const router = useRouter();
const onboardingStore = useOnboardingStore();
const form = ref();
const loading = ref(false);
const error = ref("");
const dateMenu = ref(false);

const formData = ref<OnboardingData>({
    ordinationDate: "",
    vowPreceptor: "",
    tradition: "",
    school: "",
    monastery: "",
    lifestyle: undefined
});

const traditions = ["Buddhist", "Christian", "Hindu", "Other"];

const lifestyles = [
    { value: "anchorite", title: "onboarding.step2.anchorite" },
    { value: "cenobite", title: "onboarding.step2.cenobite" },
    { value: "gyrovague", title: "onboarding.step2.gyrovague" }
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
        // Update store with step 2 data
        onboardingStore.updateStep2(formData.value);

        // Submit complete profile
        await onboardingStore.submitOnboarding();

        // Redirect to pending approval page
        router.push("/pending");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        error.value = err.message || "An error occurred during submission";
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
