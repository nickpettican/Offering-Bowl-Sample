import { validateProfile } from "../_db/validators";
import { putItem, queryItems } from "../_db/helpers";
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

export const getProfileForUser = async (userId: string) => {
    return await queryItems(
        TABLES.PROFILE,
        "userId = :userId",
        { ":userId": userId },
        "userId-index"
    );
};

/**
 * Since profile is very tightly related to the user
 * we will use userId in this case, otherwise profileId
 * would be the best option
 */
export const updateProfile = async (
    userId: string,
    updatedProfile: Profile
) => {
    if (!validateProfile(updatedProfile)) {
        throw new UnprocessableEntityError(
            `Invalid profile data: ${JSON.stringify(validateProfile.errors)}`
        );
    }

    const existingProfile = await getProfileForUser(userId);

    if (!existingProfile) {
        throw new NotFoundError("Profile not found.");
    }

    await putItem(TABLES.PROFILE, updatedProfile);

    return { ...existingProfile, ...updatedProfile };
};
