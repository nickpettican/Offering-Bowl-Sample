import express from "express";
import {
    createUserPost,
    userGet,
    userUpdate
} from "../controllers/users.controller";

const router = express.Router();

// POST create a new user
router.post("/", createUserPost);

// GET a user by ID
router.get("/:userId", userGet);

// UPDATE a user
router.put("/:userId", userUpdate);

export default router;
