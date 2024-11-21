import { validateUser } from "../_db/validators";
import { putItem, getItem } from "../_db/helpers";
import { TABLES, User } from "../_db/schemas";
import { NotFoundError, UnprocessableEntityError } from "../_utils/httpError";

export const createUser = async (user: User) => {
    if (!validateUser(user)) {
        throw new UnprocessableEntityError(
            `Invalid user data: ${JSON.stringify(validateUser.errors)}`
        );
    }
    return await putItem(TABLES.USERS, user);
};

export const getUserById = async (userId: string) => {
    return await getItem(TABLES.USERS, { userId });
};

export const updateUser = async (userId: string, updatedUser: User) => {
    if (!validateUser(updatedUser)) {
        throw new UnprocessableEntityError(
            `Invalid user data: ${JSON.stringify(validateUser.errors)}`
        );
    }

    const existingUser = await getUserById(userId);

    if (!existingUser) {
        throw new NotFoundError("User not found.");
    }

    await putItem(TABLES.USERS, updatedUser);

    return { ...existingUser, ...updatedUser };
};
