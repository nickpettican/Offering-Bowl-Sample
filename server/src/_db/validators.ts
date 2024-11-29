import Ajv from "ajv";
import { ActivityTypes } from "./schemas";

const ajv = new Ajv();

// User Schema
const DEPRECATED_userSchema = {
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

// User Schema
const userSchema = {
    type: "object",
    properties: {
        userId: { type: "string" },
        role: { type: "string", enum: ["monastic", "patron"] },
        email: { type: "string", format: "email" },
        createdAt: { type: "string", format: "date-time" }
    },
    required: ["userId", "role", "email", "createdAt"],
    additionalProperties: false
};

const userUpdateSchema = {
    type: "object",
    properties: {
        email: userSchema.properties.email
    },
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

// Base profile schema for common fields
const baseProfileSchema = {
    type: "object",
    properties: {
        profileId: { type: "string" },
        userId: { type: "string" },
        name: { type: "string", minLength: 1, maxLength: 100 },
        profilePhotoUrl: { type: "string", format: "uri-reference" },
        bio: { type: "string", maxLength: 500 }
    },
    required: ["profileId", "userId", "name"],
    additionalProperties: false
};

// Monastic profile schema
const monasticProfileSchema = {
    type: "object",
    properties: {
        ...baseProfileSchema.properties,
        gender: { type: "string", enum: ["male", "female"] },
        ordinationType: { type: "string", enum: ["novice", "complete"] },
        ordinationDate: { type: "string", format: "date-time" },
        tradition: { type: "string", minLength: 1, maxLength: 100 },
        school: { type: "string", maxLength: 100 },
        monastery: { type: "string", maxLength: 200 },
        vowPreceptor: { type: "string", minLength: 1, maxLength: 100 },
        lifestyle: {
            type: "string",
            enum: ["anchorite", "cenobite", "gyrovague"]
        },
        isApproved: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" }
    },
    required: [
        ...baseProfileSchema.required,
        "gender",
        "ordinationType",
        "ordinationDate",
        "tradition",
        "vowPreceptor",
        "lifestyle",
        "isApproved",
        "createdAt"
    ],
    additionalProperties: false
};

// Patron profile schema
const patronProfileSchema = {
    type: "object",
    properties: {
        ...baseProfileSchema.properties,
        createdAt: { type: "string", format: "date-time" }
    },
    required: [...baseProfileSchema.required, "createdAt"],
    additionalProperties: false
};

const monasticProfileUpdateSchema = {
    type: "object",
    properties: {
        name: monasticProfileSchema.properties.name,
        profilePhotoUrl: monasticProfileSchema.properties.profilePhotoUrl,
        bio: monasticProfileSchema.properties.bio,
        gender: monasticProfileSchema.properties.gender,
        ordinationType: monasticProfileSchema.properties.ordinationType,
        ordinationDate: monasticProfileSchema.properties.ordinationDate,
        tradition: monasticProfileSchema.properties.tradition,
        school: monasticProfileSchema.properties.school,
        monastery: monasticProfileSchema.properties.monastery,
        vowPreceptor: monasticProfileSchema.properties.vowPreceptor,
        lifestyle: monasticProfileSchema.properties.lifestyle
    },
    additionalProperties: false
};

const patronProfileUpdateSchema = {
    type: "object",
    properties: {
        name: patronProfileSchema.properties.name,
        profilePhotoUrl: patronProfileSchema.properties.profilePhotoUrl,
        bio: patronProfileSchema.properties.bio
    },
    additionalProperties: false
};

// Profile schema
const DEPRECATED_profileSchema = {
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
        isApproved: { type: "boolean" },
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
        "isApproved",
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
        content: {
            type: "string",
            minLength: 1,
            maxLength: 5000 // Set a reasonable limit
            // TODO add pattern
        },
        isPublic: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" }
    },
    required: ["postId", "monasticId", "isPublic", "createdAt"],
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
export const validateUser = ajv.compile(DEPRECATED_userSchema);
export const validateUserUpdate = ajv.compile(userUpdateSchema);
export const validateSettings = ajv.compile(settingsSchema);
export const validateActivity = ajv.compile(activitySchema);
export const validateContract = ajv.compile(contractSchema);
export const validatePost = ajv.compile(postSchema);
export const validateReceipt = ajv.compile(receiptSchema);
export const validateMedia = ajv.compile(mediaSchema);
export const validateProfile = ajv.compile(DEPRECATED_profileSchema);
export const validateMonasticProfile = ajv.compile(monasticProfileSchema);
export const validatePatronProfile = ajv.compile(patronProfileSchema);
export const validateMonasticProfileUpdate = ajv.compile(
    monasticProfileUpdateSchema
);
export const validatePatronProfileUpdate = ajv.compile(
    patronProfileUpdateSchema
);
// TODO add the update validators to avoid changing readonly fields
