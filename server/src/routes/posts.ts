import express from "express";
import {
    createPostPost,
    monasticPostsGet,
    monasticPostDelete,
    publicMonasticPostsGet,
    publicMonasticPostDetailsGet,
    monasticPostDetailsGet,
    patronFeedPostsGet
} from "../controllers/posts.controller";
import {
    fetchUserFromDb,
    requireRole,
    restrictToOwner
} from "../_middleware/user.middleware";
import authenticate from "../_middleware/auth.middleware";

const router = express.Router();

// Public routes

// GET posts for a specific monastic
router.get("/public/monastic/:monasticId", publicMonasticPostsGet);

// GET details for a post
router.get("/public/post/:postId", publicMonasticPostDetailsGet);

// Private routes

// Make the rest of routes use authentication
router.use(authenticate);

// Fetch the user data on every request here
router.use(fetchUserFromDb);

// GET details for a post
router.get("/post/:postId", monasticPostDetailsGet);

// GET posts for a specific monastic
router.get("/monastic/:monasticId", monasticPostsGet);

// GET feed for patron
router.get("/feed/:patronId", requireRole("patron"), patronFeedPostsGet);

// POST create a new post
router.post("/post", requireRole("monastic"), restrictToOwner, createPostPost);

// PUT update a post
router.put(
    "/post/:postId",
    requireRole("monastic"),
    restrictToOwner,
    createPostPost
);

// DELETE a post
router.delete(
    "/post/:postId",
    requireRole("monastic"),
    restrictToOwner,
    monasticPostDelete
);

export default router;
