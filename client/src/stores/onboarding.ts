/* eslint-disable @typescript-eslint/no-explicit-any */
/* Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196) */

import { defineStore } from "pinia";
import axios from "axios";

interface OnboardingData {
    // Step 1 data
    name: string;
    gender: string;
    ordinationType: "novice" | "fully-ordained";

    // Step 2 data
    ordinationDate: string;
    vowPreceptor: string;
    tradition: string;
    school: string;
    monastery: string;
    lifestyle: "anchorite" | "cenobite" | "gyrovague";
}

export const useOnboardingStore = defineStore("onboarding", {
    state: () => ({
        data: {
            name: "",
            gender: "",
            ordinationType: "" as "novice" | "fully-ordained",
            ordinationDate: "",
            vowPreceptor: "",
            tradition: "",
            school: "",
            monastery: "",
            lifestyle: "" as "anchorite" | "cenobite" | "gyrovague"
        } as OnboardingData,
        error: null as string | null,
        loading: false
    }),

    actions: {
        updateStep1(data: Partial<OnboardingData>) {
            this.data = { ...this.data, ...data };
        },

        updateStep2(data: Partial<OnboardingData>) {
            this.data = { ...this.data, ...data };
        },

        async submitOnboarding() {
            this.loading = true;
            this.error = null;

            try {
                await axios.post("/profiles", this.data);
            } catch (error: any) {
                this.error = error.response?.data?.message || "Failed to submit profile";
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});
