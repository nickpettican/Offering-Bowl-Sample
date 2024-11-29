/* eslint-disable @typescript-eslint/no-explicit-any */
/* Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196) */

import { Request, Response } from "express";
import { createUser, getUserById, updateUser } from "../models/users.model";
import { User } from "../_db/schemas";
import logger from "../_utils/logger";

// Create a new user (POST /users)
export const createUserPost = async (req: Request, res: Response) => {
    try {
        const user: User = req.body;

        // Call the model function to create a user
        await createUser(user);

        res.status(201).json({
            success: true,
            message: "User created successfully.",
            user
        });
    } catch (error: any) {
        logger.error(`Error creating user: ${error.message ?? error}`);
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message ?? error
        });
    }
};

// Get a user by ID (GET /users/:userId)
export const userGet = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Call the model function to retrieve the user
        const user = await getUserById(userId);

        if (!user) {
            logger.warn(`User not found ${userId}`);
            res.status(404).json({
                success: false,
                message: "User not found."
            });
            return;
        }

        res.json({
            success: true,
            user
        });
    } catch (error: any) {
        logger.error(`Error fetching user: ${error.message || error}`);
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message ?? error
        });
    }
};

// Update a user (PUT /users/:userId)
export const userUpdate = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const updatedData: User = req.body;

        // Call the model function to update the user
        const updatedUser = await updateUser(userId, updatedData);

        res.json({
            success: true,
            message: "User updated successfully.",
            user: updatedUser
        });
    } catch (error: any) {
        logger.error(`Error updating user: ${error.message ?? error}`);
        res.status(error.status ?? 500).json({
            success: false,
            error: error.message ?? error
        });
    }
};
