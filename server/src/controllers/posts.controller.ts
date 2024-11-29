/* eslint-disable @typescript-eslint/no-explicit-any */
/* Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196) */

import { Request, Response } from "express";
import {
    createPost,
    deletePost,
    getMonasticProfilePostsForPatron,
    getPublicPostsOfMonastic,
    getPublicPostById,
    getPostForUser,
    getPatronFeedPosts
} from "../models/posts.model";
import { Post } from "../_db/schemas";
import logger from "../_utils/logger";
import { OptionalQueryParams } from "../_types/routes";
import { UnauthorizedError } from "../_utils/httpError";

// Public routes

/**
 * Get full public details about a post
 */
export const publicMonasticPostsGet = async (req: Request, res: Response) => {
    try {
        const { monasticId } = req.params;
        const { limit = 10, lastEvaluatedKey }: OptionalQueryParams = req.query;
        const posts = await getPublicPostsOfMonastic(monasticId, {
            limit: Number(limit),
            lastEvaluatedKey
        });

        res.json({ success: true, posts });
    } catch (error: any) {
        logger.error(
            `Error getting list of public posts: ${error.message ?? error}`
        );
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message ?? error
        });
    }
};

/**
 * Get full public details about a post
 */
export const publicMonasticPostDetailsGet = async (
    req: Request,
    res: Response
) => {
    try {
        const { postId } = req.params;
        const post = await getPublicPostById(postId);

        res.json({ success: true, post });
    } catch (error: any) {
        logger.error(
            `Error getting public post details: ${error.message ?? error}`
        );
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message ?? error
        });
    }
};

// Private routes

/**
 * Get full details about a post
 */
export const monasticPostDetailsGet = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = req.user?.userId ?? req.user?.uid;

        // if might be possible that user.middleware couldn't add it
        if (!userId) {
            throw new UnauthorizedError("No user session found.");
        }

        // the following will only return a post if there is an active contract
        const post = await getPostForUser(postId, userId);

        res.json({ success: true, post });
    } catch (error: any) {
        logger.error(`Error getting post details: ${error.message ?? error}`);
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message ?? error
        });
    }
};

/**
 * Create a new post
 */
export const createPostPost = async (req: Request, res: Response) => {
    try {
        const post: Post = req.body;
        const userId = req.user?.userId ?? req.user?.uid;

        // if might be possible that user.middleware couldn't add it
        if (!userId) {
            throw new UnauthorizedError("No user session found.");
        }

        /*  TODO handle logic for uploading to S3 
            and creating a media entry with the URI */
        await createPost(post);

        res.status(201).json({
            success: true,
            message: "Post created successfully.",
            post
        });
    } catch (error: any) {
        logger.error(`Error creating post: ${error.message ?? error}`);
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message ?? error
        });
    }
};

/**
 * Get all posts for a specific monastic
 */
export const monasticPostsGet = async (req: Request, res: Response) => {
    try {
        const { monasticId } = req.params;
        const userId = req.user?.userId;
        const { limit = 10, lastEvaluatedKey }: OptionalQueryParams = req.query;

        // if might be possible that user.middleware couldn't add it
        if (!userId) {
            throw new UnauthorizedError("No user session found.");
        }

        const posts = await getMonasticProfilePostsForPatron(
            monasticId,
            userId,
            { limit, lastEvaluatedKey }
        );

        res.json({ success: true, posts });
    } catch (error: any) {
        logger.error(`Error getting post: ${error.message ?? error}`);
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message ?? error
        });
    }
};

// TODO add method for getPatronFeedPosts to fill
// the patron feed, consider pagination!

/**
 * Get the posts for the patron's feed
 */
export const patronFeedPostsGet = async (req: Request, res: Response) => {
    try {
        const { patronId } = req.params;
        const { limit = 10, lastEvaluatedKey }: OptionalQueryParams = req.query;

        const userId = req.user?.userId ?? req.user?.uid;

        // if might be possible that user.middleware couldn't add it
        if (!userId) {
            throw new UnauthorizedError("No user session found.");
        }

        const result = await getPatronFeedPosts(patronId, {
            limit,
            lastEvaluatedKey
        });

        res.json({
            success: true,
            posts: result.posts,
            lastEvaluatedKey: result.lastEvaluatedKey
        });
    } catch (error: any) {
        logger.error(`Error getting posts: ${error.message ?? error}`);
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message ?? error
        });
    }
};

/**
 * Delete a post
 */
export const monasticPostDelete = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        await deletePost(postId);

        res.json({ success: true, message: "Post deleted successfully." });
    } catch (error: any) {
        logger.error(`Error deleting post: ${error.message ?? error}`);
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message ?? error
        });
    }
};
