<!-- src/App.vue -->
<template>
    <v-app :theme="theme">
        <ErrorBoundary>
            <!-- App Bar -->
            <v-app-bar color="primary" v-if="!hideNavigation">
                <v-app-bar-nav-icon
                    @click="drawer = !drawer"
                    class="d-sm-none"
                ></v-app-bar-nav-icon>

                <v-app-bar-title>
                    <a
                        href="#"
                        class="text-decoration-none text-white"
                        @click.prevent="handleTitleClick"
                    >
                        {{ $t("app.title") }}
                    </a>
                </v-app-bar-title>

                <!-- Desktop Navigation -->
                <div class="hidden-xs">
                    <div class="d-flex align-center">
                        <!-- Public Menu Items (only shown when not authenticated) -->
                        <template v-if="!isAuthenticated">
                            <router-link
                                v-for="item in publicMenuItems"
                                :key="item.title"
                                :to="item.to"
                                class="nav-link mx-2"
                            >
                                {{ $t(item.title) }}
                            </router-link>
                        </template>

                        <!-- Private Menu Items (only shown when authenticated) -->
                        <template v-else>
                            <router-link
                                v-for="item in privateMenuItems"
                                :key="item.title"
                                :to="item.to"
                                class="nav-link mx-2"
                                :class="{ 'disabled-link': item.disabled }"
                                v-tooltip="item.disabled ? $t('nav.comingBeta') : ''"
                            >
                                {{ $t(item.title) }}
                            </router-link>
                        </template>

                        <template v-if="!isAuthenticated">
                            <div class="nav-link mx-2" @click="openSignInModal">
                                {{ $t("nav.signin") }}
                            </div>
                            <div class="nav-link-highlighted ml-2" @click="openSignUpModal">
                                {{ $t("nav.signup") }}
                            </div>
                        </template>

                        <template v-else>
                            <v-badge
                                :content="unreadNotifications"
                                :value="unreadNotifications"
                                color="error"
                            >
                                <router-link to="/notifications" class="nav-link mx-2">
                                    <v-icon>mdi-bell</v-icon>
                                </router-link>
                            </v-badge>

                            <v-menu>
                                <template v-slot:activator="{ props }">
                                    <div class="nav-link mx-2" v-bind="props">
                                        <v-icon>mdi-account-circle</v-icon>
                                    </div>
                                </template>
                                <v-list>
                                    <v-list-item :to="{ name: 'settings' }" prepend-icon="mdi-cog">
                                        {{ $t("nav.settings") }}
                                    </v-list-item>
                                    <v-list-item @click="handleLogout" prepend-icon="mdi-logout">
                                        {{ $t("nav.logout") }}
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </template>
                    </div>
                </div>
            </v-app-bar>

            <!-- Navigation Drawer (Mobile) -->
            <v-navigation-drawer v-model="drawer" temporary>
                <v-list>
                    <!-- Public Navigation Items -->
                    <template v-if="!isAuthenticated">
                        <v-list-item
                            v-for="item in publicMenuItems"
                            :key="item.title"
                            :to="item.to"
                            :prepend-icon="item.icon"
                        >
                            {{ $t(item.title) }}
                        </v-list-item>

                        <v-divider class="my-2"></v-divider>

                        <v-list-item prepend-icon="mdi-login" @click="openSignInModal">
                            {{ $t("nav.signin") }}
                        </v-list-item>

                        <v-list-item
                            prepend-icon="mdi-account-plus"
                            @click="openSignUpModal"
                            color="primary"
                        >
                            {{ $t("nav.signup") }}
                        </v-list-item>
                    </template>

                    <!-- Private Navigation Items -->
                    <template v-else>
                        <v-list-item
                            v-for="item in privateMenuItems"
                            :key="item.title"
                            :to="item.to"
                            :prepend-icon="item.icon"
                            :disabled="item.disabled"
                        >
                            {{ $t(item.title) }}
                        </v-list-item>

                        <v-divider class="my-2"></v-divider>

                        <v-list-item prepend-icon="mdi-cog" :to="{ name: 'settings' }">
                            {{ $t("nav.settings") }}
                        </v-list-item>

                        <v-list-item prepend-icon="mdi-logout" @click="handleLogout">
                            {{ $t("nav.logout") }}
                        </v-list-item>
                    </template>
                </v-list>
            </v-navigation-drawer>

            <!-- Main Content -->
            <v-main>
                <router-view v-slot="{ Component }">
                    <v-fade-transition mode="out-in">
                        <component :is="Component" />
                    </v-fade-transition>
                </router-view>
            </v-main>

            <!-- Sign Up Modal -->
            <v-dialog v-model="showSignUpModal" max-width="400">
                <v-card>
                    <v-card-title class="text-h5 pa-4">
                        {{ $t("nav.chooseSignupType") }}
                    </v-card-title>

                    <v-card-text class="pa-4">
                        <v-row>
                            <v-col cols="12">
                                <v-btn
                                    block
                                    color="primary"
                                    size="large"
                                    variant="elevated"
                                    @click="redirectToSignup('patron')"
                                >
                                    {{ $t("nav.signupAsPatron") }}
                                </v-btn>
                            </v-col>

                            <v-col cols="12">
                                <v-btn
                                    block
                                    color="secondary"
                                    size="large"
                                    variant="elevated"
                                    @click="redirectToSignup('monastic')"
                                >
                                    {{ $t("nav.signupAsMonastic") }}
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-dialog>

            <!-- Global Snackbar -->
            <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
                {{ snackbar.text }}
                <template v-slot:actions>
                    <v-btn variant="text" @click="snackbar.show = false"> Close </v-btn>
                </template>
            </v-snackbar>
        </ErrorBoundary>
    </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import ErrorBoundary from "@/components/ErrorBoundary.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const drawer = ref(false);
const showSignUpModal = ref(false);
const unreadNotifications = ref(0);

// Theme handling
const theme = computed(() => {
    return prefersDark.value ? "dark" : "light";
});

const prefersDark = ref(window.matchMedia("(prefers-color-scheme: dark)").matches);

// Watch for system theme changes
onMounted(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", (e) => {
        prefersDark.value = e.matches;
    });
});

// Global snackbar state
const snackbar = ref({
    show: false,
    text: "",
    color: "success",
    timeout: 3000
});

const hideNavigation = computed(() => {
    return ["onboardingStep1", "onboardingStep2"].includes(route.name as string);
});

const isAuthenticated = computed(() => authStore.isAuthenticated);

const publicMenuItems = [
    {
        title: "nav.about",
        to: "/about",
        icon: "mdi-information"
    },
    {
        title: "nav.howItWorks",
        to: "/how-it-works",
        icon: "mdi-help-circle"
    },
    {
        title: "nav.tax",
        to: "/tax",
        icon: "mdi-file-document"
    }
];

const privateMenuItems = computed(() => {
    const items = [
        {
            title: "nav.home",
            to: authStore.isMonastic ? "/dashboard" : "/home",
            icon: "mdi-home"
        },
        {
            title: "nav.explore",
            to: "/explore",
            icon: "mdi-compass"
        },
        {
            title: "nav.chat",
            to: "/chat",
            icon: "mdi-chat",
            disabled: true
        }
    ];

    return items;
});

// Update the app bar title click handler
const handleTitleClick = () => {
    if (isAuthenticated.value) {
        router.push(authStore.isMonastic ? "/dashboard" : "/home");
    } else {
        router.push("/");
    }
};

const openSignInModal = () => {
    router.push("/signin");
};

const openSignUpModal = () => {
    showSignUpModal.value = true;
};

const redirectToSignup = (type: "patron" | "monastic") => {
    showSignUpModal.value = false;
    router.push(`/signup?type=${type}`);
};

const handleLogout = async () => {
    try {
        await authStore.logout();
        router.push("/");
        showSnackbar("Successfully logged out", "success");
    } catch (error) {
        console.error("Error logging out", error);
        showSnackbar("Error logging out", "error");
    }
};

const showSnackbar = (text: string, color: "success" | "error" | "info" = "success") => {
    snackbar.value = {
        show: true,
        text,
        color,
        timeout: 3000
    };
};

defineExpose({ showSnackbar });
</script>

<style scoped>
.nav-link {
    color: white;
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.nav-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.nav-link-highlighted {
    color: white;
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    background-color: rgba(255, 255, 255, 0.2);
    transition: background-color 0.2s;
}

.nav-link-highlighted:hover {
    background-color: rgba(255, 255, 255, 0.3);
}

/* Hide desktop nav on mobile */
@media (max-width: 600px) {
    .hidden-xs {
        display: none !important;
    }
}
</style>
