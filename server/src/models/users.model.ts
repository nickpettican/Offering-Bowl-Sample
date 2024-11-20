import { validateUser } from "../_db/validators";
import { putItem, getItem } from "../_db/helpers";
import { TABLES, User } from "../_db/schemas";

export const createUser = async (user: User) => {
    if (!validateUser(user)) {
        throw new Error(
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
        throw new Error(
            `Invalid user data: ${JSON.stringify(validateUser.errors)}`
        );
    }

    const existingUser = await getUserById(userId);

    if (!existingUser) {
        throw new Error("User not found.");
    }

    await putItem(TABLES.USERS, updatedUser);

    return { ...existingUser, ...updatedUser };
};
