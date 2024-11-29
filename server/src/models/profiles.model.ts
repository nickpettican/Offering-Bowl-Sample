import { validateProfile } from "../_db/validators";
import { getItem, putItem, queryItems } from "../_db/helpers";
import { TABLES, Profile } from "../_db/schemas";
import { UnprocessableEntityError, NotFoundError } from "../_utils/httpError";

export const createProfile = async (profile: Profile) => {
    if (!validateProfile(profile)) {
        throw new UnprocessableEntityError(
            `Invalid profile data: ${JSON.stringify(validateProfile.errors)}`
        );
    }
    return await putItem(TABLES.PROFILE, profile);
};

export const getProfileById = async (profileId: string) => {
    return await getItem(TABLES.PROFILE, { profileId });
};

export const getProfileForUser = async (userId: string) => {
    const result = await queryItems(
        TABLES.PROFILE,
        "userId = :userId",
        { ":userId": userId },
        { indexName: "userId-index" }
    );
    return result.Items;
};

export const updateProfileForUser = async (
    userId: string,
    updatedProfile: Profile
) => {
    if (!validateProfile(updatedProfile)) {
        throw new UnprocessableEntityError(
            `Invalid profile data: ${JSON.stringify(validateProfile.errors)}`
        );
    }

    const existingProfile = await getProfileForUser(userId);

    if (!existingProfile?.length) {
        throw new NotFoundError("Profile not found.");
    }

    await putItem(TABLES.PROFILE, updatedProfile);

    return { ...existingProfile[0], ...updatedProfile };
};

export const updateProfile = async (
    profileId: string,
    updatedProfile: Profile
) => {
    if (!validateProfile(updatedProfile)) {
        throw new UnprocessableEntityError(
            `Invalid profile data: ${JSON.stringify(validateProfile.errors)}`
        );
    }

    const existingProfile = await getProfileById(profileId);

    if (!existingProfile) {
        throw new NotFoundError("Profile not found.");
    }

    await putItem(TABLES.PROFILE, updatedProfile);

    return { ...existingProfile, ...updatedProfile };
};
