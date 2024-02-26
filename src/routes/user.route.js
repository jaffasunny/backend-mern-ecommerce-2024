import { Router } from "express";
import {
	loginUser,
	logoutUser,
	refreshAccessToken,
	registerUser,
	resetPassword,
	sendResetPasswordToken,
	userProfile,
} from "./../controllers/user.controller.js";
import {
	authMiddleware,
	roleCheck,
	verifyRefreshToken,
} from "../middlewares/auth.middleware.js";

const router = Router();

// auth
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// reset password
router.post("/reset-password", sendResetPasswordToken); // get reset password token
router.post("/reset-password/:userId/:token", resetPassword); // reset password

// secured routes
router.route("/logout").post(authMiddleware, logoutUser);
router.route("/refreshToken").post(verifyRefreshToken, refreshAccessToken);

// profile
router.get("/profile", authMiddleware, roleCheck("seller"), userProfile);
// router.put("/editprofile", authenticate, AuthController.userProfileEdit);

export default router;
