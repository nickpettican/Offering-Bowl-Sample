export const TABLES = {
    USERS: "Users",
    ACTIVITIES: "Activities",
    CONTRACTS: "Contracts",
    POSTS: "Posts",
    RECEIPTS: "Receipts",
    SETTINGS: "Settings",
    MEDIA: "Media",
    PROFILE: "Profile"
};

export const ActivityTypes = [
    // patrons and monastics
    "signup",
    "profile-updated",
    "password-changed",
    // patrons
    "single-donation",
    "contract-created",
    "contract-canceled",
    "contract-updated",
    "payment-failed",
    "receipt-requested",
    // 'comment-created', // far future feature
    // monastics
    "post-created",
    "post-updated",
    "post-deleted",
    "media-uploaded",
    "profile-verified",
    "user-blocked"
] as const;

export type ActivityType = (typeof ActivityTypes)[number];

export interface User {
    userId: string;
    role: "monastic" | "patron";
    name: string;
    email: string;
    profilePhotoUrl?: string; // TODO move to mediaId
    createdAt: string;
}

export interface Settings {
    settingsId: string;
    userId: string;
    country: string;
    address?: string;
    address2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    anonymous?: boolean;
    blockedUserIds?: object;
    createdAt: string;
}

export interface Profile {
    profileId: string;
    userId: string;
    gender: "male" | "female" | "other";
    ordinationType: "novice" | "complete";
    ordinationDate: string;
    tradition: string;
    school?: string;
    monastery?: string;
    vowPreceptor: string;
    lifestyle: "anchorite" | "cenobite" | "gyrovague";
    createdAt: string;
}

export interface Activity {
    activityId: string;
    userId: string;
    type: ActivityType; // Restrict to predefined activity types
    details?: string;
    createdAt: string;
}

export interface Contract {
    contractId: string;
    patronId: string;
    monasticId: string;
    amount: number;
    recurring: boolean;
    status: "active" | "paused" | "canceled";
    createdAt: string;
}

export interface Post {
    postId: string;
    monasticId: string;
    mediaId?: string;
    content?: string;
    createdAt: string;
}

export interface Receipt {
    receiptId: string;
    contractId: string;
    mediaId: string;
    issuedAt: string;
}

export interface Media {
    mediaId: string;
    uri: string;
    createdAt: string;
}
