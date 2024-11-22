import Ajv from "ajv";
import { ActivityTypes } from "./schemas";

const ajv = new Ajv();

// User Schema
const userSchema = {
    type: "object",
    properties: {
        userId: { type: "string" },
        role: { type: "string", enum: ["monastic", "patron"] },
        name: { type: "string" },
        email: { type: "string", format: "email" },
        profilePhotoUrl: { type: "string" }, // TODO move to mediaId
        createdAt: { type: "string", format: "date-time" }
    },
    required: ["userId", "role", "name", "email", "createdAt"],
    additionalProperties: false
};

// Settings Schema
const settingsSchema = {
    type: "object",
    properties: {
        settingsId: { type: "string" },
        userId: { type: "string" },
        country: { type: "string" },
        address: { type: "string" },
        address2: { type: "string" },
        city: { type: "string" },
        state: { type: "string" },
        postcode: { type: "string" },
        anonymous: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" },
        blockedUserIds: { type: "array" }
    },
    required: ["settingsId", "userId", "country", "createdAt"],
    additionalProperties: false
};

// Profile schema
const profileSchema = {
    type: "object",
    properties: {
        profileId: { type: "string" },
        userId: { type: "string" },
        gender: { type: "string", enum: ["male", "female", "other"] },
        ordinationType: { type: "string", enum: ["novice", "complete"] },
        ordinationDate: { type: "string", format: "date-time" },
        tradition: { type: "string" },
        school: { type: "string" },
        monastery: { type: "string" },
        vowPreceptor: { type: "string" },
        lifestyle: {
            type: "string",
            enum: ["anchorite", "cenobite", "gyrovague"]
        },
        createdAt: { type: "string", format: "date-time" }
    },
    required: [
        "profileId",
        "userId",
        "gender",
        "ordinationType",
        "ordinationDate",
        "tradition",
        "vowPreceptor",
        "lifestyle",
        "createdAt"
    ],
    additionalProperties: false
};

// Activity Schema
const activitySchema = {
    type: "object",
    properties: {
        activityId: { type: "string" },
        userId: { type: "string" },
        type: { type: "string", enum: ActivityTypes }, // Use ActivityTypes for runtime validation
        details: { type: "string" },
        createdAt: { type: "string", format: "date-time" }
    },
    required: ["activityId", "userId", "type", "createdAt"],
    additionalProperties: false
};

// Contract Schema
const contractSchema = {
    type: "object",
    properties: {
        contractId: { type: "string" },
        patronId: { type: "string" },
        monasticId: { type: "string" },
        amount: { type: "number" },
        recurring: { type: "boolean" },
        status: { type: "string", enum: ["active", "paused", "canceled"] },
        createdAt: { type: "string", format: "date-time" }
    },
    required: [
        "contractId",
        "patronId",
        "monasticId",
        "amount",
        "recurring",
        "status",
        "createdAt"
    ],
    additionalProperties: false
};

// Post Schema
const postSchema = {
    type: "object",
    properties: {
        postId: { type: "string" },
        monasticId: { type: "string" },
        mediaId: { type: "string" },
        content: { type: "string" },
        createdAt: { type: "string", format: "date-time" }
    },
    required: ["postId", "monasticId", "mediaId", "createdAt"],
    additionalProperties: false
};

// Receipt Schema
const receiptSchema = {
    type: "object",
    properties: {
        receiptId: { type: "string" },
        contractId: { type: "string" },
        mediaId: { type: "string" },
        issuedAt: { type: "string", format: "date-time" }
    },
    required: ["receiptId", "contractId", "mediaId", "issuedAt"],
    additionalProperties: false
};

// Media Schema
const mediaSchema = {
    type: "object",
    properties: {
        mediaId: { type: "string" },
        uri: { type: "string" },
        createdAt: { type: "string", format: "date-time" }
    },
    required: ["mediaId", "uri", "createdAt"],
    additionalProperties: false
};

// Export Validators
export const validateUser = ajv.compile(userSchema);
export const validateSettings = ajv.compile(settingsSchema);
export const validateActivity = ajv.compile(activitySchema);
export const validateContract = ajv.compile(contractSchema);
export const validatePost = ajv.compile(postSchema);
export const validateReceipt = ajv.compile(receiptSchema);
export const validateMedia = ajv.compile(mediaSchema);
export const validateProfile = ajv.compile(profileSchema);
