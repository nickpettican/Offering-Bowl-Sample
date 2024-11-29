import express from "express";
import {
    createUserPost,
    userGet,
    userUpdate
} from "../controllers/users.controller";
import { restrictToOwner } from "../_middleware/user.middleware";

const router = express.Router();

// POST create a new user
router.post("/", createUserPost);

// GET a user by ID
router.get("/:userId", restrictToOwner, userGet);

// UPDATE a user
router.put("/:userId", restrictToOwner, userUpdate);

export default router;
