/* eslint-disable @typescript-eslint/no-explicit-any */
/* Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196) */

import { Request, Response } from "express";
import {
    createPost,
    getPostsByMonastic,
    deletePost
} from "../models/posts.model";
import { Post } from "../_db/schemas";
import logger from "../_utils/logger";

// Create a new post
export const createPostPost = async (req: Request, res: Response) => {
    try {
        const post: Post = req.body;
        /*  TODO handle logic for uploading to S3 
            and creating a media entry with the URI */
        await createPost(post);

        res.status(201).json({
            success: true,
            message: "Post created successfully.",
            post
        });
    } catch (error: any) {
        logger.error("Error creating post:", error.message);
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message
        });
    }
};

// Get posts for a specific monastic
export const monasticPostGet = async (req: Request, res: Response) => {
    try {
        const { monasticId } = req.params;
        const posts = await getPostsByMonastic(monasticId);

        res.json({ success: true, posts });
    } catch (error: any) {
        logger.error("Error getting posts:", error.message);
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message
        });
    }
};

// Delete a post
export const monasticPostDelete = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        await deletePost(postId);

        res.json({ success: true, message: "Post deleted successfully." });
    } catch (error: any) {
        logger.error("Error deleting post:", error.message);
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message
        });
    }
};
