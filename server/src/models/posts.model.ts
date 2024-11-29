/* eslint-disable @typescript-eslint/no-explicit-any */
/* Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196) */

import { validatePost } from "../_db/validators";
import { TABLES, Post } from "../_db/schemas";
import { putItem, queryItems, deleteItem, getItem } from "../_db/helpers";
import {
    ForbiddenError,
    NotFoundError,
    UnprocessableEntityError
} from "../_utils/httpError";
import {
    getActiveMonasticIdsForPatron,
    getContractsBetweenPatronAndMonastic
} from "./contracts.model";
import { OptionalQueryParams } from "../_types/routes";
import { QueryCommandOutput } from "@aws-sdk/lib-dynamodb";

/**
 * Get a public post from monastic by postId
 */
export const getPublicPostById = async (postId: string) => {
    const publicPosts = await queryItems(
        TABLES.POSTS,
        "postId = :postId AND isPublic = :isPublic",
        { ":postId": postId, ":isPublic": true }
    );

    if (!publicPosts?.Items?.length) {
        throw new NotFoundError("Post not found.");
    }

    return publicPosts?.Items?.pop();
};

/**
 * Get list of public posts by monastic using paging
 */
export const getPublicPostsOfMonastic = async (
    monasticId: string,
    { limit = 10, lastEvaluatedKey }: OptionalQueryParams = {}
) => {
    const publicPosts = await queryItems(
        TABLES.POSTS,
        "monasticId = :monasticId AND isPublic = :isPublic",
        { ":monasticId": monasticId, ":isPublic": true },
        {
            limit,
            scanIndexForward: false, // Get newest posts first
            exclusiveStartKey: lastEvaluatedKey,
            indexName: "createdAt-index"
        }
    );

    if (!publicPosts?.Items?.length) {
        return {
            posts: [],
            lastEvaluatedKey: null
        };
    }

    return {
        posts: publicPosts.Items,
        lastEvaluatedKey: publicPosts.LastEvaluatedKey
    };
};

const getPostById = async (postId: string) => {
    return await getItem(TABLES.POSTS, { postId });
};

/**
 * Get all posts by a monastic
 */
const getAllPostsOfMonastic = async (
    monasticId: string,
    optionalParams: OptionalQueryParams
) => {
    return await queryItems(
        TABLES.POSTS,
        "monasticId = :monasticId",
        { ":monasticId": monasticId },
        {
            indexName: "monasticId-index",
            limit: optionalParams.limit,
            exclusiveStartKey: optionalParams.lastEvaluatedKey
        }
    );
};

/**
 * Get individual post, if public just return, otherwise check for active contracts
 */
export const getPostForUser = async (postId: string, userId: string) => {
    // Step 1: Get the post to get the monasticId
    const post = await getPostById(postId);

    if (!post) {
        throw new NotFoundError("Post not found.");
    }

    // If it is public user can view
    if (post.isPublic) {
        return post;
    }

    // Step 2: Check against active contracts with monastic
    const contracts = await getContractsBetweenPatronAndMonastic(
        userId,
        post.monasticId
    );

    // If no contracts exist, user cannot view post
    if (!contracts?.length) {
        throw new ForbiddenError(
            "This post is only available for active patrons."
        );
    }

    // Filter contracts to check if any is active
    const activeContracts = contracts.filter(
        (contract: any) => contract.status === "active"
    );

    // If no active contracts exist, user cannot view post
    if (activeContracts.length === 0) {
        throw new ForbiddenError(
            "This post is only available for active patrons."
        );
    }

    return post;
};

/**
 * Get posts that patron can see from all subscribed monastics
 */
export const getPatronFeedPosts = async (
    patronId: string,
    { limit = 10, lastEvaluatedKey }: OptionalQueryParams = {}
) => {
    // Step 1: Get monastic IDs that have an active subscription with patron
    const monasticIds = await getActiveMonasticIdsForPatron(patronId);

    if (monasticIds.length === 0) {
        return { posts: [], lastEvaluatedKey: null };
    }

    // Step 2: Query posts  the monasticId
    const postPromises = monasticIds.map(async (monasticId: string) => {
        return await queryItems(
            TABLES.POSTS,
            "monasticId = :monasticId",
            { ":monasticId": monasticId },
            {
                limit,
                scanIndexForward: false, // Get newest posts first
                exclusiveStartKey: lastEvaluatedKey,
                indexName: "createdAt-index"
            }
        );
    });

    const allPosts = (await Promise.all(postPromises))
        .map((r: QueryCommandOutput) => (Array.isArray(r.Items) ? r.Items : []))
        .flat()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit);

    return {
        posts: allPosts,
        lastEvaluatedKey:
            allPosts.length === limit ? allPosts[allPosts.length - 1] : null
    };
};

/**
 * Get all posts from monastic that are visible to a specific patron
 */
export const getMonasticProfilePostsForPatron = async (
    monasticId: string,
    patronId: string,
    { limit = 10, lastEvaluatedKey }: OptionalQueryParams = {}
) => {
    // Step 1: Query active contracts using the GSI
    const contracts = await getContractsBetweenPatronAndMonastic(
        patronId,
        monasticId
    );

    // If no contracts exist, return an empty array
    if (!contracts || contracts.length === 0) {
        return { posts: [] };
    }

    // Filter contracts to check if any is active
    const activeContracts = contracts.filter(
        (contract: any) => contract.status === "active"
    );

    // If no active contracts exist, return an empty array
    if (activeContracts.length === 0) {
        return { posts: [] };
    }

    // Step 2: Query posts with the monasticId
    const posts = await getAllPostsOfMonastic(monasticId, {
        limit,
        lastEvaluatedKey
    });

    return {
        posts: posts.Items,
        lastEvaluatedKey: posts.LastEvaluatedKey
    };
};

/**
 * Create a new post
 */
export const createPost = async (post: Post) => {
    if (!validatePost(post)) {
        throw new UnprocessableEntityError(
            `Invalid post data: ${JSON.stringify(validatePost.errors)}`
        );
    }

    return await putItem(TABLES.POSTS, post);
};

/**
 * Delete a post
 */
export const deletePost = async (postId: string) => {
    return await deleteItem(TABLES.POSTS, { postId });
};
