import { Router } from "express";
import {
	loginUser,
	registerUser,
	userProfile,
} from "./../controllers/user.controller.js";
import { authMiddleware, roleCheck } from "../middlewares/auth.middleware.js";

const router = Router();

// auth
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// profile
router.get("/profile", authMiddleware, roleCheck("seller"), userProfile);
// router.put("/editprofile", authenticate, AuthController.userProfileEdit);

export default router;
