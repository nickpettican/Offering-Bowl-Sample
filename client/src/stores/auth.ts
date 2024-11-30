/* eslint-disable @typescript-eslint/no-explicit-any */
/* Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196) */

import { defineStore } from "pinia";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User
} from "firebase/auth";
import api from "@/services/api";
import axios from "axios";
import { promisifyObserver } from "@/utils/promisify";
import { AuthErrorType, type AuthError } from "@/types/errors";
import { t } from "@/i18n/index";

export interface UserProfile {
    userId: string;
    role: "patron" | "monastic";
    name: string;
    email: string;
}

export interface MonasticProfile {
    name: string;
    gender: string;
    ordinationType: "novice" | "fully-ordained";
    ordinationDate: Date;
    vowPreceptor: string;
    tradition: string;
    school: string;
    monastery: string;
    lifestyle: "anchorite" | "cenobite" | "gyrovague";
    isApproved: boolean;
    hasCompletedOnboarding: boolean;
}

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null as User | null,
        profile: null as UserProfile | null,
        monasticProfile: null as MonasticProfile | null,
        loading: false,
        error: null as string | null,
        uiError: null as AuthError | null,
        tokenRefreshInterval: null as ReturnType<typeof setInterval> | null,
        authInitialized: false
    }),

    getters: {
        isAuthenticated: (state): boolean => !!state.user,
        isMonastic: (state): boolean => state.profile?.role === "monastic",
        isPatron: (state): boolean => state.profile?.role === "patron",
        canAccessPrivateRoutes: (state): boolean => {
            if (!state.profile) return false;
            if (state.profile.role === "patron") return true;
            if (state.profile.role === "monastic") {
                return !!(
                    state.monasticProfile?.isApproved &&
                    state.monasticProfile?.hasCompletedOnboarding
                );
            }
            return false;
        },
        needsOnboarding: (state): boolean => {
            return (
                state.profile?.role === "monastic" && !state.monasticProfile?.hasCompletedOnboarding
            );
        },
        hasValidProfile: (state): boolean => {
            return !!(
                state.profile?.userId &&
                state.profile?.role &&
                state.profile?.name &&
                state.profile?.email
            );
        }
    },

    actions: {
        setError(type: AuthErrorType, messageKey: string) {
            this.uiError = {
                type,
                message: t(messageKey)
            } as AuthError;
        },

        async initializeAuth() {
            if (this.authInitialized) return;

            const auth = getAuth();

            // Wait for initial auth state
            const user = await promisifyObserver<User | null>((callback) =>
                onAuthStateChanged(auth, callback)
            );

            await this.handleAuthStateChange(user);

            this.authInitialized = true;
        },

        async handleAuthStateChange(user: User | null) {
            try {
                if (!user) {
                    this.resetState();
                    this.setError(AuthErrorType.SESSION_EXPIRED, "errors.auth.sessionExpired");
                    return;
                }

                if (this.hasValidProfile) {
                    return;
                }

                const token: string = await user.getIdToken();
                if (!token) {
                    this.setError(AuthErrorType.UNKNOWN, "errors.auth.unknown");
                    return;
                }

                const profile = await api.getUserProfile(user.uid);
                if (!profile) {
                    this.setError(AuthErrorType.UNKNOWN, "errors.auth.unknown");
                    return;
                }

                this.setUserData(user, profile, token);

                // TODO add profile REST API endpoint
                // if (profile.role === "monastic") {
                //     const { data: monasticProfile } = await api.get(`/profiles/${user.uid}`);
                //     this.monasticProfile = monasticProfile;
                // }

                this.setupTokenRefresh();
            } catch (error) {
                if (axios.isAxiosError(error) && !error.response) {
                    this.setError(AuthErrorType.NETWORK_ERROR, "errors.auth.network");
                } else {
                    this.setError(AuthErrorType.UNKNOWN, "errors.auth.unknown");
                }
            }
        },

        setUserData(user: User, profile: UserProfile, token: string) {
            this.user = user;
            this.profile = profile;
            localStorage.setItem("jwt", token);
        },

        setupTokenRefresh() {
            this.clearTokenRefresh();

            // Refresh token every 50 minutes
            this.tokenRefreshInterval = setInterval(
                async () => {
                    try {
                        const auth = getAuth();
                        const user = auth.currentUser;
                        if (user) {
                            const token = await user.getIdToken(true);
                            localStorage.setItem("jwt", token);
                        }
                    } catch (error) {
                        console.error("Token refresh error:", error);
                    }
                },
                50 * 60 * 1000
            );
        },

        handleError(error: unknown) {
            console.error("Auth store error:", error);
            this.error = error instanceof Error ? error.message : "Unknown error";
            this.resetState();
        },

        resetState() {
            this.user = null;
            this.profile = null;
            this.monasticProfile = null;
            this.clearTokenRefresh();
            localStorage.removeItem("jwt");
        },

        clearTokenRefresh() {
            if (this.tokenRefreshInterval) {
                clearInterval(this.tokenRefreshInterval);
                this.tokenRefreshInterval = null;
            }
        },

        async signup(email: string, password: string, role: "patron" | "monastic", name: string) {
            this.loading = true;
            this.error = null;
            try {
                const auth = getAuth();
                const { user } = await createUserWithEmailAndPassword(auth, email, password);

                const token = await user.getIdToken();
                localStorage.setItem("jwt", token);

                await api.post("/users", {
                    userId: user.uid,
                    role,
                    name,
                    email,
                    createdAt: new Date().toISOString()
                });

                this.user = user;
                this.profile = { userId: user.uid, role, name, email };
                this.setupTokenRefresh();
            } catch (error: any) {
                this.error = error.message ?? error;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async login(email: string, password: string) {
            this.loading = true;
            this.error = null;
            try {
                // firebase auth
                const auth = getAuth();
                const { user } = await signInWithEmailAndPassword(auth, email, password);

                // get the auth token
                const token = await user.getIdToken();

                // get the user data
                const profile = await api.getUserProfile(user.uid);

                // set the user data to state
                this.setUserData(user, profile, token);

                // TODO add profile REST API endpoint
                // if (profile.role === "monastic") {
                //     const { data: monasticProfile } = await api.get(`/profiles/${user.uid}`);
                //     this.monasticProfile = monasticProfile;
                // }

                this.setupTokenRefresh();
            } catch (error: any) {
                this.error = error.message ?? error;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            const auth = getAuth();
            await signOut(auth);

            this.clearTokenRefresh();
            localStorage.removeItem("jwt");

            this.user = null;
            this.profile = null;
            this.monasticProfile = null;
        },

        async submitMonasticProfile(profileData: Partial<MonasticProfile>) {
            if (!this.user) throw new Error("No authenticated user");

            this.loading = true;
            try {
                const { data } = await axios.post("/profiles", {
                    userId: this.user.uid,
                    ...profileData
                });
                this.monasticProfile = data;
            } catch (error: any) {
                this.error = error.message ?? error;
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});
