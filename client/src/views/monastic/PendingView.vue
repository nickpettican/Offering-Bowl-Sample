<template>
    <v-container class="fill-height">
        <v-row align="center" justify="center">
            <v-col cols="12" sm="10" md="8" lg="6" class="text-center">
                <v-card class="mx-auto pa-6">
                    <!-- Status Icon -->
                    <v-avatar color="primary" size="96" class="mb-6">
                        <v-icon size="64" color="white"> mdi-clock-outline </v-icon>
                    </v-avatar>

                    <h1 class="text-h4 font-weight-bold mb-4">
                        {{ $t("pending.title") }}
                    </h1>

                    <!-- Image placeholder - you'll replace this with your chosen image -->
                    <v-img
                        src="/path-to-your-image.jpg"
                        alt="Pending Approval"
                        class="mx-auto my-8"
                        max-width="400"
                        height="300"
                        cover
                    ></v-img>

                    <p class="text-body-1 mb-6">
                        {{ $t("pending.message") }}
                    </p>

                    <v-alert type="info" variant="tonal" border="start" class="mb-6 text-left">
                        <div class="text-subtitle-1 font-weight-bold mb-2">
                            {{ $t("pending.whatNext") }}
                        </div>
                        <v-list density="compact" class="bg-transparent">
                            <v-list-item
                                v-for="(step, index) in steps"
                                :key="index"
                                :prepend-icon="step.icon"
                            >
                                {{ $t(step.text) }}
                            </v-list-item>
                        </v-list>
                    </v-alert>

                    <v-btn
                        color="primary"
                        variant="outlined"
                        block
                        @click="handleLogout"
                        class="mb-4"
                    >
                        {{ $t("pending.logout") }}
                    </v-btn>

                    <p class="text-caption text-grey">
                        {{ $t("pending.support") }}
                        <a href="mailto:support@offeringbowl.org" class="text-decoration-none">
                            support@offeringbowl.org
                        </a>
                    </p>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const steps = [
    {
        icon: "mdi-email-check",
        text: "pending.steps.email"
    },
    {
        icon: "mdi-account-check",
        text: "pending.steps.review"
    },
    {
        icon: "mdi-check-circle",
        text: "pending.steps.approval"
    }
];

const handleLogout = async () => {
    await authStore.logout();
    router.push("/");
};
</script>

<style scoped>
.v-list-item {
    min-height: 40px;
}
</style>
