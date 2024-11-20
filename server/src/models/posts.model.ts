/* eslint-disable @typescript-eslint/no-explicit-any */

import { validatePost } from "../_db/validators";
import { TABLES, Post } from "../_db/schemas";
import { putItem, queryItems } from "../_db/helpers";

// Create a new post
export const createPost = async (post: Post) => {
    if (!validatePost(post)) {
        throw new Error(
            `Invalid post data: ${JSON.stringify(validatePost.errors)}`
        );
    }
    return await putItem(TABLES.POSTS, post);
};

// Get all posts by a monastic
export const getPostsByMonastic = async (monasticId: string) => {
    return await queryItems(
        TABLES.POSTS,
        "monasticId = :monasticId",
        { ":monasticId": monasticId },
        "monasticId-index" // Assuming a GSI on "monasticId"
    );
};

// Get all posts visible to a specific patron
export const getPostsForPatron = async (
    monasticId: string,
    patronId: string
) => {
    // Step 1: Query active contracts using the GSI
    const contracts = await queryItems(
        TABLES.CONTRACTS,
        "monasticId = :monasticId AND patronId = :patronId",
        {
            ":monasticId": monasticId,
            ":patronId": patronId
        },
        "patronId-monasticId-index" // Use the GSI
    );

    // If no active contracts exist, return an empty array
    if (!contracts || contracts.length === 0) {
        return [];
    }

    // Filter contracts to check if any is active
    const activeContracts = contracts.filter(
        (contract: any) => contract.status === "active"
    );

    // If no active contracts exist, return an empty array
    if (activeContracts.length === 0) {
        return [];
    }

    // Step 2: Query posts for the monasticId
    const posts = await queryItems(TABLES.POSTS, "monasticId = :monasticId", {
        ":monasticId": monasticId
    });

    return posts;
};
