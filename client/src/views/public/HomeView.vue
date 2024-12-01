<template>
    <div class="home">
        <!-- Hero Section -->
        <v-container fluid class="hero-section pa-0">
            <div class="hero-overlay">
                <v-container class="py-16">
                    <v-row justify="center">
                        <v-col cols="12" md="8" lg="6" class="text-center">
                            <!-- Offering Bowl SVG -->
                            <GiantOfferingBowl />

                            <h1 class="text-h2 font-weight-bold mb-4">
                                {{ $t("home.title") }}
                            </h1>

                            <p class="text-h6 mb-8">
                                {{ $t("home.subtitle") }}
                            </p>

                            <!-- CTA Buttons -->
                            <v-row justify="center" class="mb-16">
                                <v-col cols="12" sm="6">
                                    <v-btn
                                        block
                                        size="x-large"
                                        color="primary"
                                        variant="elevated"
                                        @click="router.push('/signup?type=patron')"
                                    >
                                        {{ $t("home.becomePatron") }}
                                    </v-btn>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-btn
                                        block
                                        size="x-large"
                                        color="secondary"
                                        variant="elevated"
                                        @click="router.push('/signup?type=monastic')"
                                    >
                                        {{ $t("home.registerMonastic") }}
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-container>
            </div>
        </v-container>

        <!-- Features Section -->
        <v-container class="py-16">
            <v-row>
                <v-col cols="12" md="4" class="text-center">
                    <v-icon size="64" color="primary" class="mb-4">mdi-heart</v-icon>
                    <h3 class="text-h5 mb-4">{{ $t("home.features.support.title") }}</h3>
                    <p>{{ $t("home.features.support.description") }}</p>
                </v-col>
                <v-col cols="12" md="4" class="text-center">
                    <v-icon size="64" color="primary" class="mb-4">mdi-account-group</v-icon>
                    <h3 class="text-h5 mb-4">{{ $t("home.features.connect.title") }}</h3>
                    <p>{{ $t("home.features.connect.description") }}</p>
                </v-col>
                <v-col cols="12" md="4" class="text-center">
                    <v-icon size="64" color="primary" class="mb-4">mdi-shield-check</v-icon>
                    <h3 class="text-h5 mb-4">{{ $t("home.features.trust.title") }}</h3>
                    <p>{{ $t("home.features.trust.description") }}</p>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import GiantOfferingBowl from "@/components/img/giantOfferingBowl.vue";

const router = useRouter();
</script>

<style scoped>
.hero-section {
    position: relative;
    background-color: rgb(18, 18, 18);
    min-height: calc(100vh - 64px);
    display: flex;
    align-items: center;
}

.hero-overlay {
    width: 100%;
}

.hero-image {
    max-width: 400px;
    width: 100%;
    height: auto;
    margin: 0 auto;
}
</style>
