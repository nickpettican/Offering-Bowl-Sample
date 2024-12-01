// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const publicRoutes = [
    {
        path: "/",
        name: "publicHome",
        component: () => import("@/views/public/HomeView.vue"),
        meta: { public: true }
    },
    {
        path: "/about",
        name: "about",
        component: () => import("@/views/public/AboutView.vue"),
        meta: { public: true }
    },
    {
        path: "/how-it-works",
        name: "howItWorks",
        component: () => import("@/views/public/HowItWorksView.vue"),
        meta: { public: true }
    },
    {
        path: "/tax",
        name: "tax",
        component: () => import("@/views/public/TaxView.vue"),
        meta: { public: true }
    },
    {
        path: "/signup",
        name: "signup",
        component: () => import("@/views/public/SignupView.vue"),
        meta: { public: true }
    },
    {
        path: "/signin",
        name: "signin",
        component: () => import("@/views/public/SigninView.vue"),
        meta: { public: true }
    },
    {
        path: "/monastic/:name",
        name: "monasticPublic",
        component: () => import("@/views/public/MonasticProfileView.vue")
    }
];

const privateRoutes = [
    // Patron private routes
    {
        path: "/home",
        name: "patronHome",
        component: () => import("@/views/patron/HomeView.vue"),
        meta: { requiresAuth: true, patronOnly: true }
    },

    // Monastic private routes
    {
        path: "/dashboard",
        name: "monasticDashboard",
        component: () => import("@/views/monastic/DashboardView.vue"),
        meta: { requiresAuth: true, monasticOnly: true }
    },
    {
        path: "/onboarding",
        children: [
            {
                path: "step1",
                name: "onboardingStep1",
                component: () => import("@/views/monastic/OnboardingStep1View.vue")
            },
            {
                path: "step2",
                name: "onboardingStep2",
                component: () => import("@/views/monastic/OnboardingStep2View.vue")
            }
        ],
        meta: { requiresAuth: true, monasticOnly: true }
    },
    {
        path: "/pending",
        name: "pending",
        component: () => import("@/views/monastic/PendingView.vue"),
        meta: { requiresAuth: true, monasticOnly: true }
    },
    {
        path: "/profile/:name",
        name: "monasticPrivate",
        component: () => import("@/views/monastic/ProfileView.vue"),
        meta: { requiresAuth: true, monasticOnly: true }
    },

    // Shared private routes
    {
        path: "/explore",
        name: "explore",
        component: () => import("@/views/shared/ExploreView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/settings",
        name: "settings",
        component: () => import("@/views/shared/SettingsView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/chat",
        name: "chat",
        component: () => import("@/views/shared/ChatView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/notifications",
        name: "notifications",
        component: () => import("@/views/shared/NotificationsView.vue"),
        meta: { requiresAuth: true }
    }
];

const routes = [...publicRoutes, ...privateRoutes];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // Wait for initial auth check to complete
    if (!authStore.authInitialized) {
        await authStore.initializeAuth();
    }

    // Add profile validation check
    if (authStore.isAuthenticated && !authStore.hasValidProfile) {
        console.warn("Invalid user profile state");
        authStore.logout();
        next({ name: "publicHome" });
        return;
    }

    // If user is authenticated and tries to access public home, redirect to appropriate dashboard
    if (authStore.isAuthenticated && to.path === "/") {
        const redirectPath = authStore.isMonastic ? "/dashboard" : "/home";
        console.log("Redirecting from root to:", redirectPath);
        next(redirectPath);
        return;
    }

    // If route requires auth and user is not authenticated
    if (to.matched.some((record) => !record.meta.public) && !authStore.isAuthenticated) {
        next({ name: "signin" });
        return;
    }

    // Additional checks for monastic/patron specific routes
    if (to.matched.some((record) => record.meta.monasticOnly) && !authStore.isMonastic) {
        next(authStore.isAuthenticated ? "/home" : { name: "signin" });
        return;
    }

    if (to.matched.some((record) => record.meta.patronOnly) && !authStore.isPatron) {
        next(authStore.isAuthenticated ? "/dashboard" : { name: "signin" });
        return;
    }

    // Check for onboarding
    if (authStore.needsOnboarding && !to.path.startsWith("/onboarding") && to.name !== "pending") {
        next({ name: "onboardingStep1" });
        return;
    }

    next();
});

export default router;
