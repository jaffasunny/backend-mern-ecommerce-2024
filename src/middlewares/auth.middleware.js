import jwt from "jsonwebtoken";
import { User } from "./../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// in production code
// if we are not using any keys like for example
// (req,res,next)
// if i'm not using res key then we'll simply do smth like this
// (req,_,next)
const authMiddleware = asyncHandler(async (req, _, next) => {
	try {
		const token =
			req.cookies?.accessToken ||
			req.header("Authorization").replace("Bearer ", "");

		console.log({ token });

		if (!token) {
			throw new ApiError(401, "Unauthorized request");
		}

		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		const user = await User.findById(decoded?._id).select(
			"-password -refreshToken"
		);

		if (!user) {
			throw new ApiError(404, "User not found");
		}

		req.user = user;
		next();
	} catch (error) {
		throw new ApiError(401, error?.message || "Please Authenticate!");
	}
});

const roleCheck = (role) => {
	return (req, res, next) => {
		if (!req.user.roles.includes(role)) {
			return res
				.status(403)
				.json(new ApiResponse(403, "Access denied, Incorrect role!"));
		}
		next();
	};
};

// Verify refresh tokens
const verifyRefreshToken = async (req, res, next) => {
	const refreshToken = req.body.refreshToken;

	try {
		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		const user = await User.findById(decoded._id);
		if (!user) {
			return res.status(401).json({ message: "Invalid refresh token" });
		}
		req.user = user;
		next();
	} catch (error) {
		return res.status(401).json({ message: "Invalid refresh token" });
	}
};

export { authMiddleware, roleCheck, verifyRefreshToken };
