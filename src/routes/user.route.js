import { Router } from "express";
import {
	loginUser,
	logoutUser,
	refreshAccessToken,
	registerUser,
	userProfile,
} from "./../controllers/user.controller.js";
import { authMiddleware, roleCheck } from "../middlewares/auth.middleware.js";

const router = Router();

// auth
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(authMiddleware, logoutUser);
router.route("/refreshToken").post(refreshAccessToken);

// profile
router.get("/profile", authMiddleware, roleCheck("seller"), userProfile);
// router.put("/editprofile", authenticate, AuthController.userProfileEdit);

export default router;
